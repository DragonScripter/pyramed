using backend.DTO;
using backend.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class StaffUsersController : ControllerBase
{
    // Ticket 27: List staff accounts
    [HttpGet]
    [Authorize(Policy = StaffPermissions.UsersRead)]
    public IActionResult GetUsers()
    {
        return StatusCode(501, new
        {
            message = "Staff user listing is not yet implemented."
        });
    }

    // Ticket 27: Create staff account
    [HttpPost]
    [Authorize(Policy = StaffPermissions.UsersWrite)]
    public IActionResult CreateUser([FromBody] CreateStaffUserRequest request)
    {
        return StatusCode(501, new
        {
            message = "Staff user creation is not yet implemented."
        });
    }

    // Ticket 27: Update staff role
    [HttpPut("{id:guid}/role")]
    [Authorize(Policy = StaffPermissions.UsersWrite)]
    public IActionResult UpdateRole(
    Guid id,
    [FromBody] UpdateStaffUserRoleRequest request)
    {
        return StatusCode(501, new
        {
            message = "Staff role updates are not yet implemented."
        });
    }

    // Ticket 27: Update staff active status
    [HttpPut("{id:guid}/active")]
    [Authorize(Policy = StaffPermissions.UsersWrite)]
  public IActionResult UpdateActiveStatus(
    Guid id,
    [FromBody] UpdateStaffUserActiveRequest request)
    {
        return StatusCode(501, new
        {
            message = "Staff active status updates are not yet implemented."
        });
    }
}