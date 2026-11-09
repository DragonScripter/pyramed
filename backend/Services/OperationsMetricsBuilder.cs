using PyraMed.Api.Models;

namespace backend.Services;

/// <summary>
/// Converts operational patient and vital data into the dashboard metrics.
/// Alert flags are counted independently, so a vital record breaching both
/// thresholds contributes two triggers.
/// </summary>
public static class OperationsMetricsBuilder
{
    public const int HeartRateAlertThreshold = 120;
    public const int SpO2AlertThreshold = 90;

    public static OperationsMetricsResponse Build(
        IEnumerable<Patient> patients,
        IEnumerable<VitalRecord> vitalRecords,
        DateTime generatedAt)
    {
        ArgumentNullException.ThrowIfNull(patients);
        ArgumentNullException.ThrowIfNull(vitalRecords);

        var windowStartedAt = generatedAt.AddHours(-1);
        var observations = vitalRecords
            .Where(vital => vital.RecordedAt >= windowStartedAt && vital.RecordedAt <= generatedAt)
            .ToList();

        var activePatientCount = patients.Count(patient =>
            string.Equals(patient.Status, "Admitted", StringComparison.OrdinalIgnoreCase));

        var alertTriggers = observations.Sum(vital =>
            (vital.HeartRate > HeartRateAlertThreshold ? 1 : 0) +
            (vital.SpO2 < SpO2AlertThreshold ? 1 : 0));

        var stableObservations = observations.Count(vital =>
            vital.HeartRate <= HeartRateAlertThreshold &&
            vital.SpO2 >= SpO2AlertThreshold);

        double? responseStability = observations.Count == 0
            ? null
            : Math.Round(stableObservations * 100d / observations.Count, 1);

        return new OperationsMetricsResponse(
            ActivePatientCount: activePatientCount,
            RollingHourAlertTriggers: alertTriggers,
            DatasetResponseStability: responseStability,
            ObservationCount: observations.Count,
            WindowStartedAt: windowStartedAt,
            GeneratedAt: generatedAt);
    }
}
