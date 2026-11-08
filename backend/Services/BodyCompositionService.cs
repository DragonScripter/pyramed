using Postgrest;
using backend.Dtos;
using PyraMed.Api.Models;

namespace backend.Services;

public interface IBodyCompositionService
{
    /// <summary>Returns null when the patient does not exist.</summary>
    Task<BodyCompositionResponse?> GetAsync(
        Guid patientId,
        DateTime? from,
        DateTime? to,
        CancellationToken cancellationToken = default);
}

public class BodyCompositionService : IBodyCompositionService
{
    private readonly Supabase.Client _supabase;

    public BodyCompositionService(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public async Task<BodyCompositionResponse?> GetAsync(
        Guid patientId,
        DateTime? from,
        DateTime? to,
        CancellationToken cancellationToken = default)
    {
        var patientResponse = await _supabase
            .From<Patient>()
            .Where(x => x.PatientId == patientId)
            .Get(cancellationToken);

        if (patientResponse.Models.FirstOrDefault() == null)
        {
            return null;
        }

        var query = _supabase
            .From<BodyCompositionRecord>()
            .Where(x => x.PatientId == patientId);

        if (from.HasValue)
        {
            query = query.Filter(
                "measured_at",
                Constants.Operator.GreaterThanOrEqual,
                from.Value.ToString("o"));
        }

        if (to.HasValue)
        {
            query = query.Filter(
                "measured_at",
                Constants.Operator.LessThanOrEqual,
                to.Value.ToString("o"));
        }

        var response = await query
            .Order("measured_at", Constants.Ordering.Ascending)
            .Get(cancellationToken);

        var points = response.Models
            .Select(x => new BodyCompositionPoint(
                x.MeasuredAt,
                x.Bmi,
                x.BodyFatPercent,
                x.MuscleMassKg))
            .ToList();

        return new BodyCompositionResponse(patientId, from, to, points);
    }
}