
using System.Security.Claims;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using PyraMed.Api.Models;

namespace backend.Middleware;

public sealed class StaffPermissionHandler
    : AuthorizationHandler<StaffPermissionRequirement>
{
    private readonly Supabase.Client _supabase;

    public StaffPermissionHandler(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        StaffPermissionRequirement requirement)
    {
        var userIdValue = context.User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return;
        }

        try
        {
            // Find the authenticated staff member.
            var profileResponse = await _supabase
                .From<StaffUser>()
                .Where(user => user.Id == userId)
                .Get();

            var staff = profileResponse.Models.FirstOrDefault();

            // Inactive or nonexistent accounts cannot access staff APIs.
            if (staff == null || !staff.IsActive)
            {
                return;
            }

            // Find the staff member's assigned role.
            var rolesResponse = await _supabase
                .From<Role>()
                .Where(role => role.Name == staff.Role)
                .Get();

            var role = rolesResponse.Models.FirstOrDefault();

            if (role == null)
            {
                return;
            }

            // Find permissions assigned to the role.
            var rolePermissionsResponse = await _supabase
                .From<RolePermission>()
                .Where(rp => rp.RoleId == role.RoleId)
                .Get();

            var permissionIds = rolePermissionsResponse.Models
                .Select(rp => rp.PermissionId)
                .ToHashSet();

            if (permissionIds.Count == 0)
            {
                return;
            }

            // Verify the required permission exists.
            var permissionsResponse = await _supabase
                .From<Permission>()
                .Where(p => p.Name == requirement.Permission)
                .Get();

            var requiredPermission =
                permissionsResponse.Models.FirstOrDefault();

            if (requiredPermission != null &&
                permissionIds.Contains(requiredPermission.PermissionId))
            {
                context.Succeed(requirement);
            }
        }
        catch (Exception)
        {
            // Fail closed if the database is unavailable
            // or permission verification fails.
            return;
        }
    }
}
