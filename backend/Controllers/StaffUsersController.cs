
using System.Security.Claims;
using backend.DTO;
using backend.Middleware;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PyraMed.Api.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class StaffUsersController : ControllerBase
{
    private readonly Supabase.Client _supabase;
    private readonly Supabase.Gotrue.AdminClient _adminClient;

    public StaffUsersController(
        Supabase.Client supabase,
        Supabase.Gotrue.AdminClient adminClient)
    {
        _supabase = supabase;
        _adminClient = adminClient;
    }

    // Ticket 27: List staff accounts
    [HttpGet]
    [Authorize(Policy = StaffPermissions.UsersRead)]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var authUsers = await _adminClient.ListUsers();

            var response = await _supabase
                .From<StaffUser>()
                .Get();

            var emailsById = (authUsers?.Users ?? [])
                .Where(user => !string.IsNullOrEmpty(user.Id))
                .ToDictionary(
                    user => user.Id!,
                    user => user.Email ?? string.Empty
                );

            var users = response.Models.Select(user => new
            {
                id = user.Id,
                email = emailsById.GetValueOrDefault(
                    user.Id.ToString()) ?? string.Empty,
                displayName = user.DisplayName,
                role = user.Role,
                isActive = user.IsActive
            }).ToList();

            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving staff users."
            });
        }
    }

    // Ticket 27: Create staff account
    [HttpPost]
    [Authorize(Policy = StaffPermissions.UsersWrite)]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateStaffUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.DisplayName) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            request.Password.Length < 8)
        {
            return BadRequest(new
            {
                message = "Valid email, display name, and password of at least 8 characters are required."
            });
        }

        if (!request.RoleId.HasValue ||
            request.RoleId.Value == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "A valid role ID is required."
            });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var displayName = request.DisplayName.Trim();

        try
        {
            var roleResponse = await _supabase
                .From<Role>()
                .Where(role => role.RoleId == request.RoleId.Value)
                .Get();

            var selectedRole = roleResponse.Models.FirstOrDefault();

            if (selectedRole == null)
            {
                return BadRequest(new
                {
                    message = "The selected role does not exist."
                });
            }

            Supabase.Gotrue.User? createdUser;

            try
            {
                createdUser = await _adminClient.CreateUser(
                    email,
                    request.Password,
                    new Supabase.Gotrue.AdminUserAttributes
                    {
                        EmailConfirm = true
                    });
            }
            catch (Exception)
            {
                return Conflict(new
                {
                    message = "Unable to create the account. The email may already be registered."
                });
            }

            if (createdUser == null ||
                !Guid.TryParse(createdUser.Id, out var userId))
            {
                return StatusCode(500, new
                {
                    message = "The authentication provider returned an invalid user ID."
                });
            }

            try
            {
                var existingResponse = await _supabase
                    .From<StaffUser>()
                    .Where(user => user.Id == userId)
                    .Get();

                var existingProfile =
                    existingResponse.Models.FirstOrDefault();

                if (existingProfile != null)
                {
                    existingProfile.DisplayName = displayName;
                    existingProfile.Role = selectedRole.Name;
                    existingProfile.IsActive = true;

                    await _supabase
                        .From<StaffUser>()
                        .Where(user => user.Id == userId)
                        .Update(existingProfile);
                }
                else
                {
                    var profile = new StaffUser
                    {
                        Id = userId,
                        DisplayName = displayName,
                        Role = selectedRole.Name,
                        IsActive = true
                    };

                    await _supabase
                        .From<StaffUser>()
                        .Insert(profile);
                }

                return StatusCode(201, new
                {
                    id = userId,
                    email,
                    displayName,
                    roleId = selectedRole.RoleId,
                    role = selectedRole.Name,
                    isActive = true
                });
            }
           catch (Exception ex)
{
    Console.WriteLine(
        $"Staff profile creation failed: {ex.GetType().Name}: {ex.Message}");

    try
    {
        await _adminClient.DeleteUser(userId.ToString());

        Console.WriteLine(
            $"Cleanup completed for user {userId}");
    }
    catch (Exception cleanupEx)
    {
        Console.WriteLine(
            $"Staff account cleanup failed: {cleanupEx.GetType().Name}: {cleanupEx.Message}");
    }

    return StatusCode(500, new
    {
        message = "Staff profile creation failed. Verify whether account cleanup succeeded."
    });
      }
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "An error occurred while creating the staff account."
            });
        }
    }

    // Ticket 27: Update staff role
    [HttpPut("{id:guid}/role")]
    [Authorize(Policy = StaffPermissions.UsersWrite)]
    public async Task<IActionResult> UpdateRole(
        Guid id,
        [FromBody] UpdateStaffUserRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (!request.RoleId.HasValue ||
            request.RoleId.Value == Guid.Empty)
        {
            return BadRequest(new
            {
                message = "A valid role ID is required."
            });
        }

        if (!Guid.TryParse(
            User.FindFirstValue("sub"),
            out var authenticatedUserId))
        {
            return Unauthorized();
        }

        try
        {
            // Verify the requested role exists.
            var roleResponse = await _supabase
                .From<Role>()
                .Where(role => role.RoleId == request.RoleId.Value)
                .Get();

            var selectedRole = roleResponse.Models.FirstOrDefault();

            if (selectedRole == null)
            {
                return BadRequest(new
                {
                    message = "The selected role does not exist."
                });
            }

            // Find the target staff member.
            var targetResponse = await _supabase
                .From<StaffUser>()
                .Where(user => user.Id == id)
                .Get();

            var target = targetResponse.Models.FirstOrDefault();

            if (target == null)
            {
                return NotFound(new
                {
                    message = "Staff account not found."
                });
            }

            // A request that leaves the role unchanged is safe.
            if (string.Equals(
                target.Role,
                selectedRole.Name,
                StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new
                {
                    id = target.Id,
                    displayName = target.DisplayName,
                    roleId = selectedRole.RoleId,
                    role = target.Role,
                    isActive = target.IsActive
                });
            }

            bool isDemotingAdministrator =
                string.Equals(
                    target.Role,
                    "Administrator",
                    StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    selectedRole.Name,
                    "Administrator",
                    StringComparison.OrdinalIgnoreCase);

            if (isDemotingAdministrator)
            {
                // Administrators cannot demote themselves.
                if (StaffUserSafetyRules.IsSelfModification(
                    authenticatedUserId,
                    id))
                {
                    return Conflict(new
                    {
                        message = "You cannot demote your own administrator account."
                    });
                }

                // Prevent demoting the last active administrator.
                if (target.IsActive)
                {
                    var allUsersResponse = await _supabase
                        .From<StaffUser>()
                        .Get();

                    int activeAdministratorCount =
                        allUsersResponse.Models.Count(user =>
                            user.IsActive &&
                            string.Equals(
                                user.Role,
                                "Administrator",
                                StringComparison.OrdinalIgnoreCase));

                    if (StaffUserSafetyRules.IsLastActiveAdministrator(
                        true,
                        activeAdministratorCount))
                    {
                        return Conflict(new
                        {
                            message = "The last active administrator cannot be demoted."
                        });
                    }
                }
            }

            // Update the profile role.
            target.Role = selectedRole.Name;

            await _supabase
                .From<StaffUser>()
                .Where(user => user.Id == id)
                .Update(target);

            return Ok(new
            {
                id = target.Id,
                displayName = target.DisplayName,
                roleId = selectedRole.RoleId,
                role = target.Role,
                isActive = target.IsActive
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "An error occurred while updating the staff role."
            });
        }
    }

    
    // Ticket 27: Update staff active status
    [HttpPut("{id:guid}/active")]
    [Authorize(Policy = StaffPermissions.UsersWrite)]
    public async Task<IActionResult> UpdateActiveStatus(
        Guid id,
        [FromBody] UpdateStaffUserActiveRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (!request.IsActive.HasValue)
        {
            return BadRequest(new
            {
                message = "An active status value is required."
            });
        }

        if (!Guid.TryParse(
            User.FindFirstValue("sub"),
            out var authenticatedUserId))
        {
            return Unauthorized();
        }

        try
        {
            // Find the staff account.
            var targetResponse = await _supabase
                .From<StaffUser>()
                .Where(user => user.Id == id)
                .Get();

            var target = targetResponse.Models.FirstOrDefault();

            if (target == null)
            {
                return NotFound(new
                {
                    message = "Staff account not found."
                });
            }

            bool newStatus = request.IsActive.Value;

            // No change required.
            if (target.IsActive == newStatus)
            {
                return Ok(new
                {
                    id = target.Id,
                    displayName = target.DisplayName,
                    role = target.Role,
                    isActive = target.IsActive
                });
            }

            if (!newStatus)
            {
                // Prevent users from deactivating themselves.
                if (StaffUserSafetyRules.IsSelfModification(
                    authenticatedUserId,
                    id))
                {
                    return Conflict(new
                    {
                        message = "You cannot deactivate your own account."
                    });
                }

                // Prevent deactivation of the last active Administrator.
                bool isAdministrator = string.Equals(
                    target.Role,
                    "Administrator",
                    StringComparison.OrdinalIgnoreCase);

                if (isAdministrator && target.IsActive)
                {
                    var allUsersResponse = await _supabase
                        .From<StaffUser>()
                        .Get();

                    int activeAdministratorCount =
                        allUsersResponse.Models.Count(user =>
                            user.IsActive &&
                            string.Equals(
                                user.Role,
                                "Administrator",
                                StringComparison.OrdinalIgnoreCase));

                    if (StaffUserSafetyRules.IsLastActiveAdministrator(
                        true,
                        activeAdministratorCount))
                    {
                        return Conflict(new
                        {
                            message = "The last active administrator cannot be deactivated."
                        });
                    }
                }
            }

            // Save the new status.
            target.IsActive = newStatus;

            await _supabase
                .From<StaffUser>()
                .Where(user => user.Id == id)
                .Update(target);

            return Ok(new
            {
                id = target.Id,
                displayName = target.DisplayName,
                role = target.Role,
                isActive = target.IsActive
            });
        }
              catch (Exception ex)
        {
            Console.WriteLine(
                $"UpdateActiveStatus failed: {ex.GetType().Name}: {ex.Message}");

            return StatusCode(500, new
            {
                message = "An error occurred while updating staff active status."
            });
        }
    }
}
