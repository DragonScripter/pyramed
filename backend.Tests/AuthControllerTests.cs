
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Controllers;

namespace backend.Tests;

public class AuthControllerTests
{
    [Fact]
    public void LoginEndpoint_AllowsAnonymousAccess()
    {
        var method = typeof(AuthController)
            .GetMethod("Login");

        Assert.NotNull(method);

        var attribute = Attribute.GetCustomAttribute(
            method,
            typeof(AllowAnonymousAttribute));

        Assert.NotNull(attribute);
    }

    [Fact]
    public void LogoutEndpoint_RequiresAuthorization()
    {
        var method = typeof(AuthController)
            .GetMethod("Logout");

        Assert.NotNull(method);

        var attribute = Attribute.GetCustomAttribute(
            method,
            typeof(AuthorizeAttribute));

        Assert.NotNull(attribute);
    }
}
