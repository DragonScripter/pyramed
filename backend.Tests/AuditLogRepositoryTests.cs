using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using backend.Audit;
using Xunit;

public sealed class AuditLogRepositoryTests : IDisposable
{
    private readonly SqliteConnection _conn = new("DataSource=:memory:");
    private readonly AuditDbContext _db;
    private readonly AuditLogRepository _repo;

    public AuditLogRepositoryTests()
    {
        _conn.Open();
        _db = new AuditDbContext(new DbContextOptionsBuilder<AuditDbContext>().UseSqlite(_conn).Options);
        _db.Database.EnsureCreated();
        _db.Database.ExecuteSqlRaw(
            "CREATE TRIGGER audit_no_update BEFORE UPDATE ON AuditLog BEGIN SELECT RAISE(ABORT,'append-only'); END;");
        _db.Database.ExecuteSqlRaw(
            "CREATE TRIGGER audit_no_delete BEFORE DELETE ON AuditLog BEGIN SELECT RAISE(ABORT,'append-only'); END;");
        _repo = new AuditLogRepository(_db);
    }

    private Task<AuditLogEntry> Add(AuditAction a = AuditAction.View, string[]? fields = null) =>
        _repo.AppendAsync(new AuditAppendRequest("u1", "Dr. Lee", "nurse", "p1", a, fields));

    [Fact]
    public async Task First_entry_uses_genesis_hash() =>
        Assert.Equal(AuditHasher.GenesisHash, (await Add()).PrevHash);

    [Fact]
    public async Task Entries_are_chained_and_verify()
    {
        var a = await Add();
        var b = await Add(AuditAction.Edit, ["phone"]);
        Assert.Equal(a.EntryHash, b.PrevHash);
        Assert.True((await _repo.VerifyChainAsync()).IsValid);
    }

    [Fact]
    public async Task Timestamp_is_utc()
    {
        var e = await Add();
        Assert.EndsWith("Z", e.TimestampUtc);
    }

    [Fact]
    public async Task Context_rejects_modification()
    {
        await Add();
        var tracked = await _db.AuditLog.FirstAsync(); // tracked this time
        _db.Entry(tracked).State = EntityState.Deleted;
        await Assert.ThrowsAsync<InvalidOperationException>(() => _db.SaveChangesAsync());
    }

    [Fact]
    public async Task Database_rejects_raw_update_and_delete()
    {
        var e = await Add();
        await Assert.ThrowsAnyAsync<Exception>(() =>
            _db.Database.ExecuteSqlRawAsync("UPDATE AuditLog SET UserRole='admin' WHERE Id={0}", e.Id));
        await Assert.ThrowsAnyAsync<Exception>(() =>
            _db.Database.ExecuteSqlRawAsync("DELETE FROM AuditLog WHERE Id={0}", e.Id));
    }

    [Fact]
    public async Task Tampering_is_detected_when_triggers_are_bypassed()
    {
        await Add(); var target = await Add(); await Add();
        await _db.Database.ExecuteSqlRawAsync("DROP TRIGGER audit_no_update");
        await _db.Database.ExecuteSqlRawAsync("UPDATE AuditLog SET UserRole='admin' WHERE Id={0}", target.Id);

        var result = await _repo.VerifyChainAsync();
        Assert.False(result.IsValid);
        Assert.Equal(target.Id, result.FirstBadEntryId);
    }

    [Fact]
    public void Repository_exposes_no_mutators() =>
        Assert.DoesNotContain(typeof(IAuditLogRepository).GetMethods(), m =>
            m.Name.StartsWith("Update") || m.Name.StartsWith("Delete") ||
            m.Name.StartsWith("Remove") || m.Name.StartsWith("Edit"));

    public void Dispose() { _db.Dispose(); _conn.Dispose(); }
}