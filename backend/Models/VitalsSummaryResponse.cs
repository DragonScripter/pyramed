using System.Text.Json.Serialization;

namespace PyraMed.Api.Models;

/// <summary>
/// JSON contract for a patient's condensed recent-vitals summary.
/// Recorded extrema describe observed values only; they are not clinical
/// classifications or diagnoses.
/// </summary>
public sealed record VitalsSummaryResponse(
    [property: JsonPropertyName("patientId")] Guid PatientId,
    [property: JsonPropertyName("recordCount")] int RecordCount,
    [property: JsonPropertyName("observationStartedAt")] DateTime? ObservationStartedAt,
    [property: JsonPropertyName("observationEndedAt")] DateTime? ObservationEndedAt,
    [property: JsonPropertyName("averageHeartRate")] double? AverageHeartRate,
    [property: JsonPropertyName("averageSpO2")] double? AverageSpO2,
    [property: JsonPropertyName("heartRate")] VitalMetricExtremaResponse? HeartRate,
    [property: JsonPropertyName("spo2")] VitalMetricExtremaResponse? SpO2,
    [property: JsonPropertyName("clinicalBrief")] string ClinicalBrief)
{
    public static VitalsSummaryResponse Empty(Guid patientId) => new(
        PatientId: patientId,
        RecordCount: 0,
        ObservationStartedAt: null,
        ObservationEndedAt: null,
        AverageHeartRate: null,
        AverageSpO2: null,
        HeartRate: null,
        SpO2: null,
        ClinicalBrief: "No recorded vital measurements are available for this patient.");

    public static string CreateClinicalBrief(
        int recordCount,
        double averageHeartRate,
        double averageSpO2,
        int lowestHeartRate,
        int highestHeartRate,
        int lowestSpO2,
        int highestSpO2) =>
        $"Based on {recordCount} recent recorded measurements, average heart rate was {averageHeartRate:0.0} bpm and average SpO2 was {averageSpO2:0.0}%. " +
        $"Recorded heart rate ranged from {lowestHeartRate} to {highestHeartRate} bpm, and SpO2 ranged from {lowestSpO2}% to {highestSpO2}%.";
}

public sealed record VitalMetricExtremaResponse(
    [property: JsonPropertyName("lowestRecorded")] VitalMeasurementResponse LowestRecorded,
    [property: JsonPropertyName("highestRecorded")] VitalMeasurementResponse HighestRecorded)
{
    public static VitalMetricExtremaResponse From(
        IEnumerable<VitalRecord> vitals,
        Func<VitalRecord, int> selector)
    {
        var lowest = vitals
            .OrderBy(selector)
            .ThenByDescending(vital => vital.RecordedAt)
            .First();
        var highest = vitals
            .OrderByDescending(selector)
            .ThenByDescending(vital => vital.RecordedAt)
            .First();

        return new VitalMetricExtremaResponse(
            LowestRecorded: new VitalMeasurementResponse(
                selector(lowest),
                lowest.RecordedAt),
            HighestRecorded: new VitalMeasurementResponse(
                selector(highest),
                highest.RecordedAt));
    }
}

public sealed record VitalMeasurementResponse(
    [property: JsonPropertyName("value")] int Value,
    [property: JsonPropertyName("recordedAt")] DateTime RecordedAt);
