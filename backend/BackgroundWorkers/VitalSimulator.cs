
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PyraMed.Api.Models;

namespace backend.BackgroundWorkers;

public class VitalSimulator : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<VitalSimulator> _logger;

    public VitalSimulator(
        IServiceScopeFactory scopeFactory,
        ILogger<VitalSimulator> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        _logger.LogInformation("Patient vital simulator started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();

                var supabase = scope.ServiceProvider
                    .GetRequiredService<Supabase.Client>();

                // Retrieve admitted patients from Supabase
                var response = await supabase
                    .From<Patient>()
                    .Where(p => p.Status == "Admitted")
                    .Get();

                var patients = response.Models;

                // Generate simulated vital signs
                var vitalRecords = patients.Select(patient =>
                    new VitalRecord
                    {
                        PatientId = patient.PatientId,
                        HeartRate = Random.Shared.Next(60, 141),
                        SpO2 = Random.Shared.Next(85, 101),
                        RecordedAt = DateTime.UtcNow
                    }).ToList();

                // Insert generated records into Supabase
                if (vitalRecords.Count > 0)
                {
                    await supabase
                        .From<VitalRecord>()
                        .Insert(vitalRecords);

                    _logger.LogInformation(
                        "Generated vital records for {Count} patients.",
                        vitalRecords.Count);
                }
                else
                {
                    _logger.LogInformation(
                        "No admitted patients found.");
                }
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while simulating patient vitals.");
            }

                        // Wait 3 seconds before the next simulation cycle
            try
            {
                await Task.Delay(
                    TimeSpan.FromSeconds(3),
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation("Patient vital simulator stopped.");
    }
}
