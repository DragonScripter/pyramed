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

        var summary = VitalsSummaryBuilder.Build(patientId, response.Models);

        if (summary.RecordCount == 0)
        {
            return summary;
        }

        var aiBrief = await _clinicalSummaryGenerator.GenerateAsync(
            summary,
            cancellationToken);

        return string.IsNullOrWhiteSpace(aiBrief)
            ? summary
            : summary with { ClinicalBrief = aiBrief };
    }
}
