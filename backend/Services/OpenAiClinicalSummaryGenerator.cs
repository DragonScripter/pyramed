using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using PyraMed.Api.Models;

namespace backend.Services;

public interface IClinicalSummaryGenerator
{
    Task<string?> GenerateAsync(
        VitalsSummaryResponse summary,
        CancellationToken cancellationToken);
}

/// <summary>
/// Optionally converts already-aggregated vital metadata into a concise brief.
/// It never sends a patient identifier, patient name, or raw vital records.
/// </summary>
public sealed class OpenAiClinicalSummaryGenerator : IClinicalSummaryGenerator
{
    private const string ResponsesEndpoint = "https://api.openai.com/v1/responses";

    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAiClinicalSummaryGenerator> _logger;
    private readonly string? _apiKey;
    private readonly string? _model;

    public OpenAiClinicalSummaryGenerator(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OpenAiClinicalSummaryGenerator> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        _model = configuration["OpenAI:Model"];
    }

    public async Task<string?> GenerateAsync(
        VitalsSummaryResponse summary,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(_model))
        {
            return null;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, ResponsesEndpoint)
        {
            Content = JsonContent.Create(new
            {
                model = _model,
                input = CreatePrompt(summary),
                store = false
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        try
        {
            using var response = await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "AI clinical summary request returned status code {StatusCode}.",
                    (int)response.StatusCode);
                return null;
            }

            await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(
                responseStream,
                cancellationToken: cancellationToken);

            return GetTwoSentenceOutput(document.RootElement);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("AI clinical summary request timed out.");
            return null;
        }
        catch (HttpRequestException exception)
        {
            _logger.LogWarning(exception, "AI clinical summary request failed.");
            return null;
        }
        catch (JsonException exception)
        {
            _logger.LogWarning(exception, "AI clinical summary response could not be read.");
            return null;
        }
    }

    private static string CreatePrompt(VitalsSummaryResponse summary) =>
        $"""
        Write exactly two concise factual sentences for a healthcare provider using only the aggregated vital metadata below.
        Do not diagnose, classify values as normal or abnormal, recommend treatment, infer causes, or add information not supplied.
        Do not mention a patient name or identifier.

        Recent measurement count: {summary.RecordCount}
        Average heart rate: {summary.AverageHeartRate:0.0} bpm
        Average SpO2: {summary.AverageSpO2:0.0}%
        Recorded heart-rate range: {summary.HeartRate!.LowestRecorded.Value}-{summary.HeartRate.HighestRecorded.Value} bpm
        Recorded SpO2 range: {summary.SpO2!.LowestRecorded.Value}-{summary.SpO2.HighestRecorded.Value}%
        """;

    private static string? GetTwoSentenceOutput(JsonElement response)
    {
        if (!response.TryGetProperty("output", out var output) ||
            output.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var text = new StringBuilder();

        foreach (var item in output.EnumerateArray())
        {
            if (!item.TryGetProperty("type", out var type) || type.GetString() != "message" ||
                !item.TryGetProperty("content", out var content) ||
                content.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var part in content.EnumerateArray())
            {
                if (part.TryGetProperty("type", out var partType) &&
                    partType.GetString() == "output_text" &&
                    part.TryGetProperty("text", out var outputText))
                {
                    text.Append(outputText.GetString());
                    text.Append(' ');
                }
            }
        }

        var normalized = Regex.Replace(text.ToString().Trim(), @"\s+", " ");
        var sentences = Regex.Split(normalized, @"(?<=[.!?])\s+")
            .Select(sentence => sentence.Trim())
            .Where(sentence => sentence.Length > 0)
            .ToList();

        return sentences.Count == 2 &&
            sentences.All(sentence => sentence.EndsWith('.') ||
                sentence.EndsWith('!') ||
                sentence.EndsWith('?'))
            ? string.Join(" ", sentences)
            : null;
    }
}
