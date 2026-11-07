using backend.Services;
using PyraMed.Api.Models;
using Xunit;

namespace backend.Tests;

public sealed class OperationsMetricsBuilderTests
{
    private static readonly DateTime GeneratedAt = new(2026, 11, 7, 20, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Build_CalculatesActivePatientsAlertFlagsAndStability()
    {
        var patients = new[]
        {
            new Patient { Status = "Admitted" },
            new Patient { Status = "admitted" },
            new Patient { Status = "Discharged" }
        };
        var vitals = new[]
        {
            CreateVital(80, 98, -10),
            CreateVital(130, 88, -20),
            CreateVital(121, 97, -30),
            CreateVital(75, 99, -61)
        };

        var result = OperationsMetricsBuilder.Build(patients, vitals, GeneratedAt);

        Assert.Equal(2, result.ActivePatientCount);
        Assert.Equal(3, result.RollingHourAlertTriggers);
        Assert.Equal(33.3, result.DatasetResponseStability);
        Assert.Equal(3, result.ObservationCount);
        Assert.Equal(GeneratedAt.AddHours(-1), result.WindowStartedAt);
    }

    [Fact]
    public void Build_WithoutObservations_ReturnsNoStabilityAverage()
    {
        var result = OperationsMetricsBuilder.Build([], [], GeneratedAt);

        Assert.Equal(0, result.RollingHourAlertTriggers);
        Assert.Null(result.DatasetResponseStability);
        Assert.Equal(0, result.ObservationCount);
    }

    private static VitalRecord CreateVital(int heartRate, int spo2, int minutesFromGeneratedAt) => new()
    {
        HeartRate = heartRate,
        SpO2 = spo2,
        RecordedAt = GeneratedAt.AddMinutes(minutesFromGeneratedAt)
    };
}
