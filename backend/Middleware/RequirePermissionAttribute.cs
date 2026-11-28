using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PyraMed.Api.Models;

namespace backend.Middleware;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    protected readonly string PermissionName;

    public RequirePermissionAttribute(string permissionName)
    {
        PermissionName = permissionName;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user.Identity?.IsAuthenticated != true)
        {
            context.Result = new ObjectResult(new { message = "Authentication required." })
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
            return;
        }

        var userIdClaim = user.FindFirst("sub")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new ObjectResult(new { message = "Invalid authenticated user." })
            {
                StatusCode = StatusCodes.Status401Unauthorized
            };
            return;
        }

        try
        {
            var supabase = context.HttpContext.RequestServices
                .GetRequiredService<Supabase.Client>();

            var profile = (await supabase.From<UserProfile>()
                .Where(p => p.Id == userId)
                .Get()).Models.FirstOrDefault();

            if (profile == null || string.IsNullOrWhiteSpace(profile.Role))
            {
                context.Result = Forbidden();
                return;
            }

            var role = (await supabase.From<Role>()
                .Where(r => r.Name == profile.Role)
                .Get()).Models.FirstOrDefault();
            var permission = (await supabase.From<Permission>()
                .Where(p => p.Name == PermissionName)
                .Get()).Models.FirstOrDefault();

            if (role == null || permission == null)
            {
                context.Result = Forbidden();
                return;
            }

            var mapping = (await supabase.From<RolePermission>()
                .Where(link => link.RoleId == role.RoleId)
                .Where(link => link.PermissionId == permission.PermissionId)
                .Get()).Models.FirstOrDefault();

            if (mapping == null)
            {
                context.Result = Forbidden();
            }
        }
        catch (Exception)
        {
            context.Result = new ObjectResult(new
            {
                message = "Unable to verify permissions."
            })
            {
                StatusCode = StatusCodes.Status503ServiceUnavailable
            };
        }
    }

    private static ObjectResult Forbidden() => new(new
    {
        message = "You do not have permission to perform this action."
    })
    {
        StatusCode = StatusCodes.Status403Forbidden
    };
}
