using backend.Services;
using PyraMed.Api.Models;
using Xunit;

namespace backend.Tests;

public sealed class VitalsSummaryBuilderTests
{
    private static readonly Guid PatientId = Guid.Parse("5d6272a2-0f4d-4e4e-b374-dfd04732320c");
    private static readonly DateTime Start = new(2026, 10, 23, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Build_OneHundredRecords_CalculatesAveragesAndRecordedExtrema()
    {
        var vitals = Enumerable.Range(0, 100)
            .Select(index => index switch
            {
                0 => CreateVital(60, 90, index),
                1 => CreateVital(140, 100, index),
                _ => CreateVital(80, 97, index)
            });

        var result = VitalsSummaryBuilder.Build(PatientId, vitals);

        Assert.Equal(100, result.RecordCount);
        Assert.Equal(80.4, result.AverageHeartRate);
        Assert.Equal(97.0, result.AverageSpO2);
        Assert.Equal(Start, result.ObservationStartedAt);
        Assert.Equal(Start.AddMinutes(99), result.ObservationEndedAt);
        Assert.Equal(60, result.HeartRate!.LowestRecorded.Value);
        Assert.Equal(140, result.HeartRate.HighestRecorded.Value);
        Assert.Equal(90, result.SpO2!.LowestRecorded.Value);
        Assert.Equal(100, result.SpO2.HighestRecorded.Value);
    }

    [Fact]
    public void Build_FewerThanOneHundredRecords_CalculatesTheAvailableRecords()
    {
        var vitals = new[]
        {
            CreateVital(70, 95, 2),
            CreateVital(80, 97, 0),
            CreateVital(90, 99, 1)
        };

        var result = VitalsSummaryBuilder.Build(PatientId, vitals);

        Assert.Equal(3, result.RecordCount);
        Assert.Equal(80.0, result.AverageHeartRate);
        Assert.Equal(97.0, result.AverageSpO2);
        Assert.Equal(Start, result.ObservationStartedAt);
        Assert.Equal(Start.AddMinutes(2), result.ObservationEndedAt);
    }

    [Fact]
    public void Build_NoRecords_ReturnsAnEmptyConsistentSummary()
    {
        var result = VitalsSummaryBuilder.Build(PatientId, []);

        Assert.Equal(PatientId, result.PatientId);
        Assert.Equal(0, result.RecordCount);
        Assert.Null(result.AverageHeartRate);
        Assert.Null(result.AverageSpO2);
        Assert.Null(result.HeartRate);
        Assert.Null(result.SpO2);
        Assert.Equal(
            "No recorded vital measurements are available for this patient.",
            result.ClinicalBrief);
    }

    [Fact]
    public void Build_RepeatedExtrema_UsesTheMostRecentMeasurementForTies()
    {
        var vitals = new[]
        {
            CreateVital(70, 95, 0),
            CreateVital(70, 95, 5),
            CreateVital(70, 95, 2)
        };

        var result = VitalsSummaryBuilder.Build(PatientId, vitals);

        Assert.Equal(Start.AddMinutes(5), result.HeartRate!.LowestRecorded.RecordedAt);
        Assert.Equal(Start.AddMinutes(5), result.HeartRate.HighestRecorded.RecordedAt);
        Assert.Equal(Start.AddMinutes(5), result.SpO2!.LowestRecorded.RecordedAt);
        Assert.Equal(Start.AddMinutes(5), result.SpO2.HighestRecorded.RecordedAt);
    }

    private static VitalRecord CreateVital(int heartRate, int spo2, int minutesAfterStart) => new()
    {
        PatientId = PatientId,
        HeartRate = heartRate,
        SpO2 = spo2,
        RecordedAt = Start.AddMinutes(minutesAfterStart)
    };
}
