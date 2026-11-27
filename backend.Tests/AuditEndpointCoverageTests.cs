using System.Reflection;
using backend.Audit;
using backend.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Xunit;

public sealed class AuditEndpointCoverageTests
{
    [Theory]
    [InlineData(typeof(PatientController))]
    [InlineData(typeof(BodyCompositionController))]
    [InlineData(typeof(CdsController))]
    public void Patient_information_controllers_use_the_audit_filter(Type controllerType)
    {
        Assert.True(HasAuditFilter(controllerType));
    }

    [Fact]
    public void Patient_bed_overview_uses_the_audit_filter()
    {
        var action = typeof(OperationsController).GetMethod(
            nameof(OperationsController.GetBedOverview));

        Assert.NotNull(action);
        Assert.True(HasAuditFilter(action!));
    }

    [Fact]
    public void No_audit_log_route_exposes_mutation_endpoints()
    {
        var mutationVerbs = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            HttpMethods.Put,
            HttpMethods.Patch,
            HttpMethods.Delete
        };

        var auditRoutes = typeof(PatientController).Assembly
            .GetTypes()
            .Where(type => typeof(ControllerBase).IsAssignableFrom(type))
            .SelectMany(GetRouteEndpoints)
            .Where(endpoint => endpoint.RouteTemplate?.Contains("audit", StringComparison.OrdinalIgnoreCase) == true)
            .Where(endpoint => endpoint.HttpMethods.Any(mutationVerbs.Contains));

        Assert.Empty(auditRoutes);
    }

    private static bool HasAuditFilter(MemberInfo member) =>
        member.GetCustomAttributes<ServiceFilterAttribute>(inherit: true)
            .Any(attribute => attribute.ServiceType == typeof(PatientAuditFilter));

    private static IEnumerable<(string? RouteTemplate, IReadOnlyList<string> HttpMethods)> GetRouteEndpoints(
        Type controllerType)
    {
        var controllerRoute = controllerType
            .GetCustomAttributes(inherit: true)
            .OfType<IRouteTemplateProvider>()
            .Select(attribute => attribute.Template)
            .FirstOrDefault();

        return controllerType
            .GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
            .SelectMany(method => method
                .GetCustomAttributes(inherit: true)
                .OfType<IActionHttpMethodProvider>()
                .Select(attribute => (
                    RouteTemplate: CombineRoutes(
                        controllerRoute,
                        (attribute as IRouteTemplateProvider)?.Template),
                    HttpMethods: (IReadOnlyList<string>)attribute.HttpMethods)));
    }

    private static string? CombineRoutes(string? controllerRoute, string? actionRoute) =>
        string.Join('/', new[] { controllerRoute, actionRoute }
            .Where(route => !string.IsNullOrWhiteSpace(route)));
}
