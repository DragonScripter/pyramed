namespace backend.Audit;

public sealed record AuditQuery(
    string? UserName,
    string? PatientId,
    DateTimeOffset? From,
    DateTimeOffset? To,
    int Page,
    int PageSize,
    string SortBy,
    bool Descending);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);