using Microsoft.EntityFrameworkCore;

namespace Pyramed.Audit;

public sealed class AuditDbContext(DbContextOptions<AuditDbContext> options) : DbContext(options)
{
    public DbSet<AuditLogEntry> AuditLog => Set<AuditLogEntry>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<AuditLogEntry>(e =>
        {
            e.ToTable("AuditLog");
            e.HasKey(x => x.Id);
            e.Property(x => x.Action).HasConversion<string>().HasMaxLength(10);
            e.Property(x => x.UserId).HasMaxLength(128);
            e.Property(x => x.UserName).HasMaxLength(256);
            e.Property(x => x.UserRole).HasMaxLength(64);
            e.Property(x => x.PatientId).HasMaxLength(128);
            e.Property(x => x.TimestampUtc).HasMaxLength(40);
            e.Property(x => x.PrevHash).HasMaxLength(64);
            e.Property(x => x.EntryHash).HasMaxLength(64);

            e.HasIndex(x => x.PatientId);
            e.HasIndex(x => x.EntryHash).IsUnique();
            // Two entries can never share a predecessor, so a race that would fork the chain fails loudly.
            e.HasIndex(x => x.PrevHash).IsUnique();
        });
    }

    // Code-level guard: no code path may modify or delete an existing entry.
    private void RejectMutations()
    {
        var bad = ChangeTracker.Entries<AuditLogEntry>()
            .Any(x => x.State is EntityState.Modified or EntityState.Deleted);
        if (bad)
            throw new InvalidOperationException("AuditLog is append-only: update/delete is not allowed.");
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        RejectMutations();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        RejectMutations();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
}