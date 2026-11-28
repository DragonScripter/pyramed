using backend.Services;
using backend.Middleware;
using Microsoft.AspNetCore.Mvc;
using PyraMed.Api.Models;
using backend.Security;
using backend.Audit;

namespace backend.Controllers;

[ApiController]
[Route("api/cds")]
[ServiceFilter(typeof(PatientAuditFilter))]
public class CdsController : ControllerBase
{
    private readonly Supabase.Client _supabase;
    private readonly CdsValidationEngine _engine;

    public CdsController(Supabase.Client supabase, CdsValidationEngine engine)
    {
        _supabase = supabase;
        _engine = engine;
    }

    [HttpGet("evaluate/{patientId}")]
    [RequirePermission(RbacPermissions.RulesRead)]
    public async Task<IActionResult> Evaluate(string patientId)
    {
        if (!Guid.TryParse(patientId, out var id))
            return BadRequest(new { message = "Invalid patient ID." });

        try
        {
            var response = await _supabase
                .From<VitalRecord>()
                .Where(v => v.PatientId == id)
                .Order(v => v.RecordedAt, Postgrest.Constants.Ordering.Descending)
                .Limit(1)
                .Get();

            var latest = response.Models.FirstOrDefault();
            if (latest == null)
                return NotFound(new { message = "No vitals recorded for this patient." });

            return Ok(_engine.Evaluate(latest));
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred while evaluating patient vitals." });
        }
    }
}
