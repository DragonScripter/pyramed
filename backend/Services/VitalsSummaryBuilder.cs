using PyraMed.Api.Models;

namespace backend.Services;

/// <summary>
/// Converts vital records already selected for a patient into the API summary
/// contract. This calculation has no database or AI dependency.
/// </summary>
public static class VitalsSummaryBuilder
{
    public static VitalsSummaryResponse Build(
        Guid patientId,
        IEnumerable<VitalRecord> vitalRecords)
    {
        ArgumentNullException.ThrowIfNull(vitalRecords);

        var vitals = vitalRecords
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

        return new VitalsSummaryResponse(
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
    }
}
