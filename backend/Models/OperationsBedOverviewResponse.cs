using System.Text.Json.Serialization;

namespace PyraMed.Api.Models;

/// <summary>
/// Rows displayed in the Clinical Analyst bed overview. The current schema
/// has no bed assignment field, so BedLabel is explicitly Unassigned.
/// </summary>
public sealed record OperationsBedOverviewResponse(
    [property: JsonPropertyName("generatedAt")] DateTime GeneratedAt,
    [property: JsonPropertyName("beds")] IReadOnlyList<OperationsBedOverviewRow> Beds);

public sealed record OperationsBedOverviewRow(
    [property: JsonPropertyName("bedLabel")] string BedLabel,
    [property: JsonPropertyName("patientId")] Guid PatientId,
    [property: JsonPropertyName("patientName")] string PatientName,
    [property: JsonPropertyName("admissionStatus")] string AdmissionStatus,
    [property: JsonPropertyName("monitoringStatus")] string MonitoringStatus,
    [property: JsonPropertyName("alertFlagCount")] int AlertFlagCount,
    [property: JsonPropertyName("heartRate")] int? HeartRate,
    [property: JsonPropertyName("spo2")] int? SpO2,
    [property: JsonPropertyName("recordedAt")] DateTime? RecordedAt);
