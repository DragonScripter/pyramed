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
    private readonly IClinicalSummaryGenerator _clinicalSummaryGenerator;

    public ClinicalRules(
        Supabase.Client supabase,
        IClinicalSummaryGenerator clinicalSummaryGenerator)
    {
        _supabase = supabase;
        _clinicalSummaryGenerator = clinicalSummaryGenerator;
    }

    /// <summary>
    /// Retrieves the most recent 100 records for a patient and calculates their
    /// averages and per-metric recorded extrema.
    /// </summary>
    public async Task<VitalsSummaryResponse> GetVitalsSummaryAsync(
        Guid patientId,
        CancellationToken cancellationToken = default)
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
            return VitalsSummaryResponse.Empty(patientId);
        }

        var averageHeartRate = Math.Round(
            vitals.Average(vital => vital.HeartRate),
            1);
        var averageSpO2 = Math.Round(
            vitals.Average(vital => vital.SpO2),
            1);

        var summary = new VitalsSummaryResponse(
            PatientId: patientId,
            RecordCount: vitals.Count,
            ObservationStartedAt: vitals.First().RecordedAt,
            ObservationEndedAt: vitals.Last().RecordedAt,
            AverageHeartRate: averageHeartRate,
            AverageSpO2: averageSpO2,
            HeartRate: VitalMetricExtremaResponse.From(
                vitals,
                vital => vital.HeartRate),
            SpO2: VitalMetricExtremaResponse.From(
                vitals,
                vital => vital.SpO2),
            ClinicalBrief: VitalsSummaryResponse.CreateClinicalBrief(
                vitals.Count,
                averageHeartRate,
                averageSpO2,
                vitals.Min(vital => vital.HeartRate),
                vitals.Max(vital => vital.HeartRate),
                vitals.Min(vital => vital.SpO2),
                vitals.Max(vital => vital.SpO2)));

        var aiBrief = await _clinicalSummaryGenerator.GenerateAsync(
            summary,
            cancellationToken);

        return string.IsNullOrWhiteSpace(aiBrief)
            ? summary
            : summary with { ClinicalBrief = aiBrief };
    }
}
