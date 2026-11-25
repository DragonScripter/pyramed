using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace backend.Audit;

// Deliberately no Update/Delete/Remove members.
public interface IAuditLogRepository
{
    Task<AuditLogEntry> AppendAsync(AuditAppendRequest request, CancellationToken ct = default);
    Task<AuditLogEntry?> GetAsync(long id, CancellationToken ct = default);
    Task<IReadOnlyList<AuditLogEntry>> ListForPatientAsync(
        string patientId, int limit = 100, int offset = 0, CancellationToken ct = default);
    Task<ChainVerification> VerifyChainAsync(CancellationToken ct = default);
}

