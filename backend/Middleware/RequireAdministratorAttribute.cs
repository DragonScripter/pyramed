using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Middleware;

public class RequireAdministratorAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (user.Identity?.IsAuthenticated != true)
        {
            context.Result = new ObjectResult(new { message = "Authentication required." }) { StatusCode = 401 };
            return;
        }

        if (!user.IsInRole("Administrator"))
        {
            context.Result = new ObjectResult(new { message = "Only System Administrators can modify roles." }) { StatusCode = 403 };
        }
    }
}