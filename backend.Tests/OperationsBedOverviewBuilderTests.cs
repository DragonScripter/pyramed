using backend.Services;
using PyraMed.Api.Models;
using Xunit;

namespace backend.Tests;

public sealed class OperationsBedOverviewBuilderTests
{
    private static readonly Guid AliceId = Guid.Parse("df7a9f1d-346c-4a4c-a48f-f4450475b001");
    private static readonly Guid BeaId = Guid.Parse("df7a9f1d-346c-4a4c-a48f-f4450475b002");
    private static readonly Guid ChrisId = Guid.Parse("df7a9f1d-346c-4a4c-a48f-f4450475b003");
    private static readonly DateTime GeneratedAt = new(2026, 11, 7, 20, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Build_UsesTheLatestVitalAndClassifiesMonitoringStatus()
    {
        var patients = new[]
        {
            new Patient { PatientId = BeaId, Name = "Bea", Status = "Admitted" },
            new Patient { PatientId = ChrisId, Name = "Chris", Status = "Admitted" },
            new Patient { PatientId = AliceId, Name = "Alice", Status = "Discharged" }
        };
        var vitals = new[]
        {
            CreateVital(AliceId, 88, 98, -10),
            CreateVital(AliceId, 130, 87, -5),
            CreateVital(BeaId, 75, 99, -3)
        };

        var result = OperationsBedOverviewBuilder.Build(patients, vitals, GeneratedAt);

        Assert.Equal(new[] { "Alice", "Bea", "Chris" }, result.Beds.Select(row => row.PatientName));
        var alice = result.Beds[0];
        Assert.Equal("Unassigned", alice.BedLabel);
        Assert.Equal("Critical", alice.MonitoringStatus);
        Assert.Equal(2, alice.AlertFlagCount);
        Assert.Equal(130, alice.HeartRate);
        Assert.Equal(87, alice.SpO2);

        Assert.Equal("Stable", result.Beds[1].MonitoringStatus);
        Assert.Equal("No telemetry", result.Beds[2].MonitoringStatus);
        Assert.Null(result.Beds[2].HeartRate);
    }

    private static VitalRecord CreateVital(
        Guid patientId,
        int heartRate,
        int spo2,
        int minutesFromGeneratedAt) => new()
    {
        PatientId = patientId,
        HeartRate = heartRate,
        SpO2 = spo2,
        RecordedAt = GeneratedAt.AddMinutes(minutesFromGeneratedAt)
    };
}
