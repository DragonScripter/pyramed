using Microsoft.AspNetCore.Authorization;

namespace backend.Middleware;

public sealed class StaffPermissionRequirement
    : IAuthorizationRequirement
{
    public string Permission { get; }

    public StaffPermissionRequirement(string permission)
    {
        if (string.IsNullOrWhiteSpace(permission))
        {
            throw new ArgumentException(
                "Permission cannot be empty.",
                nameof(permission));
        }

        Permission = permission;
    }
}