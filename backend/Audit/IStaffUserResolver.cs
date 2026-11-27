using backend.Models;

namespace backend.Audit;

public interface IStaffUserResolver
{
    Task<StaffUser?> FindByIdAsync(Guid userId, CancellationToken ct = default);
}
