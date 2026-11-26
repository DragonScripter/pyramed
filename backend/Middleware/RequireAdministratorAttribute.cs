using backend.Security;

namespace backend.Middleware;

// Kept as a compatibility alias for existing role-management endpoints.
// Authorization is now based on the explicit roles.write permission.
public sealed class RequireAdministratorAttribute : RequirePermissionAttribute
{
    public RequireAdministratorAttribute()
        : base(RbacPermissions.RolesWrite)
    {
    }
}
