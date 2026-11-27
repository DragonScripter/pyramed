using System.Security.Claims;
using System.Text.Json;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Audit;

public sealed class PatientAuditFilter : IAsyncActionFilter
{
    private readonly IAuditLogRepository _auditRepository;
    private readonly IStaffUserResolver _staffUserResolver;
    private readonly ILogger<PatientAuditFilter> _logger;

    public PatientAuditFilter(
        IAuditLogRepository auditRepository,
        IStaffUserResolver staffUserResolver,
        ILogger<PatientAuditFilter> logger)
    {
        _auditRepository = auditRepository;
        _staffUserResolver = staffUserResolver;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var httpContext = context.HttpContext;
        var method = httpContext.Request.Method;

        var isView = HttpMethods.IsGet(method);

        var isEdit =
            HttpMethods.IsPost(method) ||
            HttpMethods.IsPut(method) ||
            HttpMethods.IsPatch(method);

        if (!isView && !isEdit)
        {
            await next();
            return;
        }

        // Identify the authenticated user.
        var userIdValue = httpContext.User.FindFirstValue("sub");

        if (httpContext.User.Identity?.IsAuthenticated != true ||
            !Guid.TryParse(userIdValue, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(new
            {
                message = "Authentication is required."
            });

            return;
        }

        StaffUser? staff;

        try
        {
            staff = await _staffUserResolver.FindByIdAsync(
                userId,
                httpContext.RequestAborted);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unable to resolve staff identity for patient audit.");

            context.Result = new ObjectResult(new
            {
                message = "Unable to verify staff identity."
            })
            {
                StatusCode = StatusCodes.Status503ServiceUnavailable
            };

            return;
        }

        if (staff == null || !staff.IsActive)
        {
            context.Result = new ForbidResult();
            return;
        }

        // Execute the original controller action.
        var executedContext = await next();

        if (executedContext.Exception != null)
        {
            return;
        }

        if (executedContext.Result is not ObjectResult result)
        {
            return;
        }

        var statusCode = result.StatusCode ?? StatusCodes.Status200OK;

        if (statusCode < 200 || statusCode >= 300)
        {
            return;
        }

        try
        {
            var patientIds = new HashSet<string>(
                StringComparer.OrdinalIgnoreCase);

            // Extract patient ID from the route.
            if (context.RouteData.Values.TryGetValue(
                "patientId", out var routePatientId))
            {
                if (Guid.TryParse(
                    routePatientId?.ToString(), out var patientId))
                {
                    patientIds.Add(patientId.ToString());
                }
            }

           // Successful patient access must identify the affected patients,
          // except when a read returns an empty collection.
            if (result.Value != null && patientIds.Count == 0)
            {
                var json = JsonSerializer.SerializeToElement(
                    result.Value,
                    new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                CollectPatientIds(json, patientIds);
            }

            // Successful edits must identify the affected patient.
           if (patientIds.Count == 0 &&
       !(isView && result.Value is System.Collections.ICollection collection
        && collection.Count == 0))
            {
                throw new InvalidOperationException(
                    "No patient ID was found for the audit entry.");
            }

            var action = isView
                ? AuditAction.View
                : AuditAction.Edit;

            foreach (var patientId in patientIds)
            {
                await _auditRepository.AppendAsync(
                    new AuditAppendRequest(
                        staff.Id.ToString(),
                        staff.DisplayName,
                        staff.Role,
                        patientId,
                        action),
                    CancellationToken.None);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Patient audit capture failed for staff user {UserId}.",
                staff.Id);

            // Prevent unaudited patient information from being returned.
            executedContext.Result = new ObjectResult(new
            {
                message = "Patient audit logging failed."
            })
            {
                StatusCode = StatusCodes.Status503ServiceUnavailable
            };
        }
    }

    private static void CollectPatientIds(
        JsonElement element,
        HashSet<string> patientIds)
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in element.EnumerateObject())
            {
                if (string.Equals(
                        property.Name,
                        "patientId",
                        StringComparison.OrdinalIgnoreCase) &&
                    property.Value.ValueKind == JsonValueKind.String &&
                    Guid.TryParse(
                        property.Value.GetString(),
                        out var patientId))
                {
                    patientIds.Add(patientId.ToString());
                }
                else
                {
                    CollectPatientIds(property.Value, patientIds);
                }
            }
        }
        else if (element.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in element.EnumerateArray())
            {
                CollectPatientIds(item, patientIds);
            }
        }
    }
}
