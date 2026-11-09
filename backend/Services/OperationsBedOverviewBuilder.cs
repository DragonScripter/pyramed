using PyraMed.Api.Models;

namespace backend.Services;

/// <summary>
/// Produces one operational overview row for every known patient. Monitoring
/// status is based on the most recent vital received during the lookback window.
/// </summary>
public static class OperationsBedOverviewBuilder
{
    public static OperationsBedOverviewResponse Build(
        IEnumerable<Patient> patients,
        IEnumerable<VitalRecord> vitalRecords,
        DateTime generatedAt)
    {
        ArgumentNullException.ThrowIfNull(patients);
        ArgumentNullException.ThrowIfNull(vitalRecords);

        var latestVitalsByPatient = vitalRecords
            .GroupBy(vital => vital.PatientId)
            .ToDictionary(
                group => group.Key,
                group => group.OrderByDescending(vital => vital.RecordedAt).First());

        var rows = patients
            .OrderBy(patient => patient.Name, StringComparer.OrdinalIgnoreCase)
            .Select(patient => CreateRow(
                patient,
                latestVitalsByPatient.GetValueOrDefault(patient.PatientId)))
            .ToList();

        return new OperationsBedOverviewResponse(generatedAt, rows);
    }

    private static OperationsBedOverviewRow CreateRow(Patient patient, VitalRecord? latestVital)
    {
        if (latestVital is null)
        {
            return new OperationsBedOverviewRow(
                BedLabel: "Unassigned",
                PatientId: patient.PatientId,
                PatientName: patient.Name,
                AdmissionStatus: patient.Status,
                MonitoringStatus: "No telemetry",
                AlertFlagCount: 0,
                HeartRate: null,
                SpO2: null,
                RecordedAt: null);
        }

        var alertFlagCount =
            (latestVital.HeartRate > OperationsMetricsBuilder.HeartRateAlertThreshold ? 1 : 0) +
            (latestVital.SpO2 < OperationsMetricsBuilder.SpO2AlertThreshold ? 1 : 0);

        return new OperationsBedOverviewRow(
            BedLabel: "Unassigned",
            PatientId: patient.PatientId,
            PatientName: patient.Name,
            AdmissionStatus: patient.Status,
            MonitoringStatus: alertFlagCount > 0 ? "Critical" : "Stable",
            AlertFlagCount: alertFlagCount,
            HeartRate: latestVital.HeartRate,
            SpO2: latestVital.SpO2,
            RecordedAt: latestVital.RecordedAt);
    }
}
