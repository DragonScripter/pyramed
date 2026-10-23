using PyraMed.Api.Models;

namespace backend.Services;

/// <summary>
/// Builds a concise, calculation-only view of a patient's recent vital records.
/// This service reports observed extrema; it does not apply clinical thresholds
/// or classify a reading as medically abnormal.
/// </summary>
public sealed class ClinicalRules
{
    private const int RecentVitalLimit = 100;

    private readonly Supabase.Client _supabase;

    public ClinicalRules(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    /// <summary>
    /// Retrieves the most recent 100 records for a patient and calculates their
    /// averages and per-metric recorded extrema.
    /// </summary>
    public async Task<VitalsSummary> GetVitalsSummaryAsync(Guid patientId)
    {
        var response = await _supabase
            .From<VitalRecord>()
            .Where(vital => vital.PatientId == patientId)
            .Order(vital => vital.RecordedAt, Postgrest.Constants.Ordering.Descending)
            .Range(0, RecentVitalLimit - 1)
            .Get();

        // The database query is descending so it can select the latest records.
        // Sort chronologically before reporting the observation window.
        var vitals = response.Models
            .OrderBy(vital => vital.RecordedAt)
            .ToList();

        if (vitals.Count == 0)
        {
            return VitalsSummary.Empty(patientId);
        }

        return new VitalsSummary(
            PatientId: patientId,
            RecordCount: vitals.Count,
            ObservationStartedAt: vitals.First().RecordedAt,
            ObservationEndedAt: vitals.Last().RecordedAt,
            AverageHeartRate: Math.Round(vitals.Average(vital => vital.HeartRate), 1),
            AverageSpO2: Math.Round(vitals.Average(vital => vital.SpO2), 1),
            HeartRate: VitalMetricExtrema.From(
                vitals,
                vital => vital.HeartRate),
            SpO2: VitalMetricExtrema.From(
                vitals,
                vital => vital.SpO2));
    }
}

public sealed record VitalsSummary(
    Guid PatientId,
    int RecordCount,
    DateTime? ObservationStartedAt,
    DateTime? ObservationEndedAt,
    double? AverageHeartRate,
    double? AverageSpO2,
    VitalMetricExtrema? HeartRate,
    VitalMetricExtrema? SpO2)
{
    public static VitalsSummary Empty(Guid patientId) => new(
        PatientId: patientId,
        RecordCount: 0,
        ObservationStartedAt: null,
        ObservationEndedAt: null,
        AverageHeartRate: null,
        AverageSpO2: null,
        HeartRate: null,
        SpO2: null);
}

/// <summary>
/// The lowest and highest observed values for one vital metric. These values are
/// descriptive extrema, not clinical anomaly classifications.
/// </summary>
public sealed record VitalMetricExtrema(
    VitalMeasurement LowestRecorded,
    VitalMeasurement HighestRecorded)
{
    public static VitalMetricExtrema From(
        IEnumerable<VitalRecord> vitals,
        Func<VitalRecord, int> selector)
    {
        var ordered = vitals
            .OrderBy(selector)
            .ThenBy(vital => vital.RecordedAt)
            .ToList();

        var lowest = ordered.First();
        var highest = ordered.Last();

        return new VitalMetricExtrema(
            LowestRecorded: new VitalMeasurement(selector(lowest), lowest.RecordedAt),
            HighestRecorded: new VitalMeasurement(selector(highest), highest.RecordedAt));
    }
}

public sealed record VitalMeasurement(int Value, DateTime RecordedAt);
