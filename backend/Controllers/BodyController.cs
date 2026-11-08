using Microsoft.AspNetCore.Mvc;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/patients/{patientId}/body-composition")]
// TODO: enable once roles are wired up in the API (dashboard is Clinical Analyst only):
// [Authorize(Roles = "ClinicalAnalyst")]
public class BodyCompositionController : ControllerBase
{
    private readonly IBodyCompositionService _bodyCompositionService;

    public BodyCompositionController(IBodyCompositionService bodyCompositionService)
    {
        _bodyCompositionService = bodyCompositionService;
    }

    /// <summary>
    /// Returns the patient's BMI, body fat % and muscle mass as a time series.
    /// Optional filters: ?from=2026-01-01&amp;to=2026-06-30 (inclusive, ISO 8601).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(BodyCompositionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BodyCompositionResponse>> GetBodyComposition(
        string patientId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        if (!Guid.TryParse(patientId, out var id))
        {
            return BadRequest(new { message = "Invalid patient ID." });
        }

        if (from.HasValue && to.HasValue && from.Value > to.Value)
        {
            return BadRequest(new { message = "'from' must be earlier than or equal to 'to'." });
        }

        try
        {
            var result = await _bodyCompositionService.GetAsync(
                id,
                from,
                to,
                HttpContext.RequestAborted);

            if (result == null)
            {
                return NotFound(new { message = "Patient not found." });
            }

            // No readings in range is a valid 200 with an empty Points list,
            // so the frontend can render its empty state.
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving body composition data."
            });
        }
    }
}