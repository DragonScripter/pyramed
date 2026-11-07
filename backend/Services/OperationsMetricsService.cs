using PyraMed.Api.Models;

namespace backend.Services;

public sealed class OperationsMetricsService
{
    private const int PageSize = 1_000;
    private readonly Supabase.Client _supabase;

    public OperationsMetricsService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<OperationsMetricsResponse> GetMetricsAsync()
    {
        var generatedAt = DateTime.UtcNow;
        var patientsTask = GetPatientsAsync();
        var vitalRecordsTask = GetVitalRecordsAsync(generatedAt.AddHours(-1));

        await Task.WhenAll(patientsTask, vitalRecordsTask);

        return OperationsMetricsBuilder.Build(
            await patientsTask,
            await vitalRecordsTask,
            generatedAt);
    }

    public async Task<OperationsBedOverviewResponse> GetBedOverviewAsync()
    {
        var generatedAt = DateTime.UtcNow;
        var patientsTask = GetPatientsAsync();
        var vitalRecordsTask = GetVitalRecordsAsync(generatedAt.AddHours(-1));

        await Task.WhenAll(patientsTask, vitalRecordsTask);

        return OperationsBedOverviewBuilder.Build(
            await patientsTask,
            await vitalRecordsTask,
            generatedAt);
    }

    private async Task<List<Patient>> GetPatientsAsync()
    {
        var response = await _supabase
            .From<Patient>()
            .Get();

        return response.Models;
    }

    private async Task<List<VitalRecord>> GetVitalRecordsAsync(DateTime windowStartedAt)
    {
        var vitalRecords = new List<VitalRecord>();

        for (var offset = 0; ; offset += PageSize)
        {
            var response = await _supabase
                .From<VitalRecord>()
                .Where(vital => vital.RecordedAt >= windowStartedAt)
                .Order(vital => vital.RecordedAt, Postgrest.Constants.Ordering.Ascending)
                .Range(offset, offset + PageSize - 1)
                .Get();

            vitalRecords.AddRange(response.Models);

            if (response.Models.Count < PageSize)
            {
                return vitalRecords;
            }
        }
    }
}
