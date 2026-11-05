
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly Supabase.Client _supabase;

    public UsersController(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    // Issue #45: Retrieve the authenticated user's profile
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authenticated user."
            });
        }

        try
        {
            var response = await _supabase
                .From<UserProfile>()
                .Where(profile => profile.Id == userId)
                .Get();

            var profile = response.Models.FirstOrDefault();

            if (profile == null)
            {
                return NotFound(new
                {
                    message = "User profile not found."
                });
            }

            return Ok(new
            {
                id = profile.Id,
                fullName = profile.FullName,
                avatarUrl = profile.AvatarUrl,
                role = profile.Role
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving your profile."
            });
        }
    }

    // Issue #45: Update the authenticated user's profile
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateUserProfileRequest request)
    {
        var userIdClaim = User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authenticated user."
            });
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new
            {
                message = "Full name is required."
            });
        }

        try
        {
            var response = await _supabase
                .From<UserProfile>()
                .Where(profile => profile.Id == userId)
                .Get();

            var profile = response.Models.FirstOrDefault();

            if (profile == null)
            {
                return NotFound(new
                {
                    message = "User profile not found."
                });
            }

            // Only modify fields the user is permitted to edit.
            // Never update the user's ID or role.
            profile.FullName = request.FullName.Trim();

            var updateQuery = _supabase
                .From<UserProfile>()
                .Where(p => p.Id == userId)
                .Set(p => p.FullName, profile.FullName);

            // Update avatar only when a URL is provided.
            // Null values leave the existing avatar unchanged.
            if (request.AvatarUrl != null)
            {
                updateQuery = updateQuery.Set(
                    p => p.AvatarUrl!,
                    request.AvatarUrl);
            }

            await updateQuery.Update();

            // Retrieve the saved profile to return actual database values.
            var updatedResponse = await _supabase
                .From<UserProfile>()
                .Where(p => p.Id == userId)
                .Get();

            var updatedProfile = updatedResponse.Models.FirstOrDefault();

            if (updatedProfile == null)
            {
                return NotFound(new
                {
                    message = "User profile not found."
                });
            }

            return Ok(new
            {
                message = "Profile updated successfully.",
                id = updatedProfile.Id,
                fullName = updatedProfile.FullName,
                avatarUrl = updatedProfile.AvatarUrl,
                role = updatedProfile.Role
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"Profile update failed: {ex.GetType().Name}: {ex.Message}");

            return StatusCode(500, new
            {
                message = "An error occurred while updating your profile."
            });
        }
    }
}
