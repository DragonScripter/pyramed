using backend.Services;
using Microsoft.AspNetCore.Mvc;
using PyraMed.Api.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/operations")]
public sealed class OperationsController : ControllerBase
{
    private readonly OperationsMetricsService _operationsMetricsService;

    public OperationsController(OperationsMetricsService operationsMetricsService)
    {
        _operationsMetricsService = operationsMetricsService;
    }

    [HttpGet("metrics")]
    [ProducesResponseType(typeof(OperationsMetricsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OperationsMetricsResponse>> GetMetrics()
    {
        try
        {
            return Ok(await _operationsMetricsService.GetMetricsAsync());
        }
        catch
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving operations metrics."
            });
        }
    }
}
