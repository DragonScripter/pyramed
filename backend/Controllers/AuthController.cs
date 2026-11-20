
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTO;
using backend.Services;
using Supabase.Gotrue.Exceptions;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        try
        {
            var session = await _authService.LoginAsync(
                request.Email.Trim(),
                request.Password);

            if (session == null ||
                string.IsNullOrEmpty(session.AccessToken))
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            return Ok(new LoginResponse
            {
                AccessToken = session.AccessToken,
                RefreshToken = session.RefreshToken ?? "",
                ExpiresIn = session.ExpiresIn
            });
        }

                  catch (GotrueException)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }
        catch (Exception)
        {
            return StatusCode(503, new
            {
                message = "Authentication service unavailable."
            });
        }
    }

[Authorize]
[HttpPost("logout")]
public async Task<IActionResult> Logout()
{
    var authorizationHeader =
        Request.Headers.Authorization.ToString();

    if (!authorizationHeader.StartsWith(
        "Bearer ",
        StringComparison.OrdinalIgnoreCase))
    {
        return Unauthorized(new
        {
            message = "Authentication token is required."
        });
    }

    var accessToken = authorizationHeader["Bearer ".Length..].Trim();

    if (string.IsNullOrWhiteSpace(accessToken))
    {
        return Unauthorized(new
        {
            message = "Authentication token is required."
        });
    }

    try
    {
        await _authService.LogoutAsync(accessToken);

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }
    catch (Exception)
    {
        return StatusCode(503, new
        {
            message = "Unable to complete logout."
        });
    }
}
}

