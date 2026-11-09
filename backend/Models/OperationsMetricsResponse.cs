using System.Text.Json.Serialization;

namespace PyraMed.Api.Models;

/// <summary>
/// System-wide operational metrics calculated for the rolling one-hour window.
/// Stability reflects the configured alert thresholds and is not a diagnosis.
/// </summary>
public sealed record OperationsMetricsResponse(
    [property: JsonPropertyName("activePatientCount")] int ActivePatientCount,
    [property: JsonPropertyName("rollingHourAlertTriggers")] int RollingHourAlertTriggers,
    [property: JsonPropertyName("datasetResponseStability")] double? DatasetResponseStability,
    [property: JsonPropertyName("observationCount")] int ObservationCount,
    [property: JsonPropertyName("windowStartedAt")] DateTime WindowStartedAt,
    [property: JsonPropertyName("generatedAt")] DateTime GeneratedAt);
