using backend.Models;

namespace backend.Audit;

public sealed class SupabaseStaffUserResolver(Supabase.Client supabase)
    : IStaffUserResolver
{
    public async Task<StaffUser?> FindByIdAsync(
        Guid userId,
        CancellationToken ct = default)
    {
        var response = await supabase
            .From<StaffUser>()
            .Where(user => user.Id == userId)
            .Get();

        return response.Models.FirstOrDefault();
    }
}
