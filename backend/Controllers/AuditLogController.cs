using backend.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Middleware;
namespace backend.Controllers;

[ApiController]
[Route("api/auditlog")]
[Authorize(Policy = StaffPermissions.AuditRead)]
public class AuditLogController(IAuditLogRepository repo) : ControllerBase
{
    private static readonly string[] SortFields = ["timestamp", "username", "patientid"];

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? userName,
        [FromQuery] string? patientId,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string sortBy = "timestamp",
        [FromQuery] string sortDir = "desc",
        CancellationToken ct = default)
    {
        if (from is not null && to is not null && from > to)
            return BadRequest(new { message = "'from' must be earlier than 'to'." });
        if (!SortFields.Contains(sortBy.ToLowerInvariant()))
            return BadRequest(new { message = "sortBy must be timestamp, userName, or patientId." });

        var query = new AuditQuery(
            userName, patientId, from, to,
            Math.Max(page, 1),
            Math.Clamp(pageSize, 1, 100),
            sortBy,
            !sortDir.Equals("asc", StringComparison.OrdinalIgnoreCase));

        return Ok(await repo.QueryAsync(query, ct));
    }
}