using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Pyramed.Audit;
public sealed class AuditLogRepository(AuditDbContext db) : IAuditLogRepository
{
    // Serializes appends within this process so two requests can't read the same "previous" hash.
    private static readonly SemaphoreSlim Gate = new(1, 1);

    public async Task<AuditLogEntry> AppendAsync(AuditAppendRequest r, CancellationToken ct = default)
    {
        var fieldsJson = JsonSerializer.Serialize(r.ChangedFields ?? Array.Empty<string>());
        var timestamp = DateTime.UtcNow.ToString("O");

        await Gate.WaitAsync(ct);
        try
        {
            var prevHash = await db.AuditLog.AsNoTracking()
                .OrderByDescending(e => e.Id)
                .Select(e => e.EntryHash)
                .FirstOrDefaultAsync(ct) ?? AuditHasher.GenesisHash;

            var entry = new AuditLogEntry
            {
                UserId = r.UserId,
                UserName = r.UserName,
                UserRole = r.UserRole,
                PatientId = r.PatientId,
                Action = r.Action,
                TimestampUtc = timestamp,
                ChangedFieldsJson = fieldsJson,
                PrevHash = prevHash,
                EntryHash = AuditHasher.Compute(
                    r.UserId, r.UserName, r.UserRole, r.PatientId,
                    r.Action, timestamp, fieldsJson, prevHash)
            };

            db.AuditLog.Add(entry);
            await db.SaveChangesAsync(ct);
            return entry;
        }
        finally
        {
            Gate.Release();
        }
    }

    public Task<AuditLogEntry?> GetAsync(long id, CancellationToken ct = default) =>
        db.AuditLog.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<IReadOnlyList<AuditLogEntry>> ListForPatientAsync(
        string patientId, int limit = 100, int offset = 0, CancellationToken ct = default) =>
        await db.AuditLog.AsNoTracking()
            .Where(e => e.PatientId == patientId)
            .OrderByDescending(e => e.Id)
            .Skip(offset).Take(Math.Clamp(limit, 1, 500))
            .ToListAsync(ct);

    public async Task<ChainVerification> VerifyChainAsync(CancellationToken ct = default)
    {
        var expectedPrev = AuditHasher.GenesisHash;

        await foreach (var e in db.AuditLog.AsNoTracking().OrderBy(x => x.Id).AsAsyncEnumerable())
        {
            var recomputed = AuditHasher.Compute(
                e.UserId, e.UserName, e.UserRole, e.PatientId,
                e.Action, e.TimestampUtc, e.ChangedFieldsJson, e.PrevHash);

            if (e.PrevHash != expectedPrev || e.EntryHash != recomputed)
                return new ChainVerification(false, e.Id);

            expectedPrev = e.EntryHash;
        }
        return new ChainVerification(true, null);
    }
}