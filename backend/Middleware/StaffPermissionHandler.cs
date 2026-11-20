using Microsoft.AspNetCore.Authorization;

namespace backend.Middleware;

public sealed class StaffPermissionHandler
    : AuthorizationHandler<StaffPermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        StaffPermissionRequirement requirement)
    {
        // Ticket 27: Fail closed until the staff User model
        // and database-backed permission checks are available.
        //
        // Do not call context.Succeed(requirement) without
        // verifying the authenticated staff user's permissions.

        return Task.CompletedTask;
    }
}