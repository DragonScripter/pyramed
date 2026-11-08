namespace backend.Dtos;

/// <summary>One measurement in the time series.</summary>
public record BodyCompositionPoint(
    DateTime MeasuredAt,
    decimal? Bmi,
    decimal? BodyFatPercent,
    decimal? MuscleMassKg);

/// <summary>
/// Response for GET api/patients/{id}/body-composition.
/// Points are sorted by MeasuredAt ascending so charts can plot them directly.
/// From/To echo the applied range (null = unbounded).
/// </summary>
public record BodyCompositionResponse(
    Guid PatientId,
    DateTime? From,
    DateTime? To,
    IReadOnlyList<BodyCompositionPoint> Points);