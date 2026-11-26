using backend.Middleware;
using backend.Security;
using Microsoft.AspNetCore.Mvc;
using PyraMed.Api.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly Supabase.Client _supabase;

    public RolesController(Supabase.Client supabase) => _supabase = supabase;

    public class CreateRoleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<string>? Permissions { get; set; }
    }

    public class UpdateRolePermissionsRequest
    {
        public List<string>? Permissions { get; set; }
    }

    [HttpGet]
    [RequirePermission(RbacPermissions.RolesRead)]
    public async Task<IActionResult> GetRoles()
    {
        try
        {
            var roles = (await _supabase.From<Role>()
                .Order(x => x.Name, Postgrest.Constants.Ordering.Ascending).Get()).Models;
            var permNames = (await _supabase.From<Permission>().Get()).Models
                .ToDictionary(p => p.PermissionId, p => p.Name);
            var links = (await _supabase.From<RolePermission>().Get()).Models;

            var byRole = links
                .GroupBy(l => l.RoleId)
                .ToDictionary(g => g.Key,
                              g => g.Select(l => permNames[l.PermissionId]).OrderBy(n => n).ToList());

            return Ok(roles.Select(r => new
            {
                roleId = r.RoleId,
                name = r.Name,
                description = r.Description,
                permissions = byRole.GetValueOrDefault(r.RoleId) ?? new List<string>()
            }));
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving roles." });
        }
    }

    [HttpPost]
    [RequireAdministrator]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        var name = request.Name?.Trim();
        if (string.IsNullOrEmpty(name) || name.Length > 50)
            return BadRequest(new { message = "Role name is required and must be 50 characters or fewer." });

        try
        {
            var existing = (await _supabase.From<Role>().Get()).Models;
            if (existing.Any(r => r.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
                return Conflict(new { message = $"A role named '{name}' already exists." });

            var (perms, unknown) = await ResolvePermissionsAsync(request.Permissions ?? new());
            if (unknown.Count > 0)
                return BadRequest(new { message = "Unknown permissions.", unknown });

            var inserted = (await _supabase.From<Role>()
                .Insert(new Role { Name = name, Description = request.Description?.Trim() }))
                .Models.FirstOrDefault();

            if (inserted == null)
                return StatusCode(500, new { message = "Role could not be created." });

            if (perms.Count > 0)
            {
                await _supabase.From<RolePermission>().Insert(
                    perms.Select(p => new RolePermission
                    {
                        RoleId = inserted.RoleId,
                        PermissionId = p.PermissionId
                    }).ToList());
            }

            return StatusCode(201, new
            {
                roleId = inserted.RoleId,
                name = inserted.Name,
                description = inserted.Description,
                permissions = perms.Select(p => p.Name).OrderBy(n => n)
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred while creating the role." });
        }
    }

    [HttpPut("{id}/permissions")]
    [RequireAdministrator]
    public async Task<IActionResult> UpdateRolePermissions(
        string id, [FromBody] UpdateRolePermissionsRequest request)
    {
        if (!Guid.TryParse(id, out var roleId))
            return BadRequest(new { message = "Invalid role ID." });
        if (request.Permissions is null)
            return BadRequest(new { message = "permissions is required." });

        try
        {
            var role = (await _supabase.From<Role>().Where(x => x.RoleId == roleId).Get())
                .Models.FirstOrDefault();
            if (role == null) return NotFound(new { message = "Role not found." });

            // Guard against admins locking themselves out
            if (role.Name.Equals("Administrator", StringComparison.OrdinalIgnoreCase))
                return Conflict(new { message = "The Administrator role's permissions cannot be changed." });

            var (wanted, unknown) = await ResolvePermissionsAsync(request.Permissions);
            if (unknown.Count > 0)
                return BadRequest(new { message = "Unknown permissions.", unknown });

            var current = (await _supabase.From<RolePermission>()
                .Where(x => x.RoleId == roleId).Get()).Models;

            var wantedIds = wanted.Select(p => p.PermissionId).ToHashSet();
            var toAdd = wantedIds.Except(current.Select(c => c.PermissionId)).ToList();
            var toRemove = current.Where(c => !wantedIds.Contains(c.PermissionId)).ToList();

            // Add first, then remove, so a failure never leaves the role with no permissions
            if (toAdd.Count > 0)
            {
                await _supabase.From<RolePermission>().Insert(
                    toAdd.Select(pid => new RolePermission { RoleId = roleId, PermissionId = pid }).ToList());
            }
            foreach (var link in toRemove)
                await _supabase.From<RolePermission>().Where(x => x.Id == link.Id).Delete();

            return Ok(new
            {
                roleId,
                name = role.Name,
                permissions = wanted.Select(p => p.Name).OrderBy(n => n)
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred while updating role permissions." });
        }
    }

    private async Task<(List<Permission> Found, List<string> Unknown)> ResolvePermissionsAsync(
        IEnumerable<string> names)
    {
        var requested = names.Select(n => n.Trim()).Where(n => n.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var all = (await _supabase.From<Permission>().Get()).Models;

        var found = all.Where(p => requested.Contains(p.Name, StringComparer.OrdinalIgnoreCase)).ToList();
        var unknown = requested
            .Where(n => !all.Any(p => p.Name.Equals(n, StringComparison.OrdinalIgnoreCase))).ToList();
        return (found, unknown);
    }
}
