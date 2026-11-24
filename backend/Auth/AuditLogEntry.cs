namespace Pyramed.Audit;

public enum AuditAction { View, Edit }

public sealed class AuditLogEntry
{
    public long Id { get; init; }
    public required string UserId { get; init; }
    public required string UserName { get; init; }   // snapshot, so renames don't rewrite history
    public required string UserRole { get; init; }
    public required string PatientId { get; init; }
    public required AuditAction Action { get; init; }
    public required string TimestampUtc { get; init; }      // ISO 8601 "O" string, always UTC
    public required string ChangedFieldsJson { get; init; } // field NAMES only, never values (avoids copying PHI)
    public required string PrevHash { get; init; }
    public required string EntryHash { get; init; }
}

public sealed record AuditAppendRequest(
    string UserId,
    string UserName,
    string UserRole,
    string PatientId,
    AuditAction Action,
    IReadOnlyList<string>? ChangedFields = null);

public sealed record ChainVerification(bool IsValid, long? FirstBadEntryId);