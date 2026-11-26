using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Middleware;
using backend.Security;
using PyraMed.Api.Models;
using backend.Audit;

namespace backend.Controllers;

[ApiController]
[Route("api/patient")]
[ServiceFilter(typeof(PatientAuditFilter))]
public class PatientController : ControllerBase
 {
    private readonly Supabase.Client _supabase;
    private readonly ClinicalRules _clinicalRules;

    public PatientController(
        Supabase.Client supabase,
        ClinicalRules clinicalRules)
    {
        _supabase = supabase;
        _clinicalRules = clinicalRules;
    }

    public class CreatePatientRequest
    {
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
    }

       public class UpdatePatientRequest
    {
        public string? Name { get; set; }
        public int? Age { get; set; }
        public string? Status { get; set; }
    }

    [HttpPost]
    [RequirePermission(RbacPermissions.PatientsWrite)]
    public async Task<IActionResult> CreatePatient(
        [FromBody] CreatePatientRequest request)
    {
        var patient = new Patient
        {
            Name = request.Name,
            Age = request.Age,
            Status = "Admitted"
        };

        var response = await _supabase
            .From<Patient>()
            .Insert(patient);

        var inserted = response.Models.FirstOrDefault();

        if (inserted == null)
        {
            return StatusCode(500, "Patient could not be created.");
        }
        var fresh = await _supabase
            .From<Patient>()
            .Where(x => x.PatientId == inserted.PatientId)
            .Get();
        

        var createdPatient = fresh.Models.FirstOrDefault() ?? inserted;

        return Ok(new
        {
            patientId = createdPatient.PatientId,
            name = createdPatient.Name,
            age = createdPatient.Age,
            status = createdPatient.Status,
            createdAt = createdPatient.CreatedAt
        });
    }
    // Ticket #16: Get a paginated list of patients
    [HttpGet]
    [RequirePermission(RbacPermissions.PatientsRead)]
    public async Task<IActionResult> GetPatients(
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
    if (limit < 1 || limit > 100 || offset < 0)
        return BadRequest(new { message = "Limit must be between 1 and 100, and offset cannot be negative." });

    try
    {
        var response = await _supabase
            .From<Patient>()
            .Order(x => x.PatientId, Postgrest.Constants.Ordering.Ascending)
            .Range(offset, offset + limit - 1)
            .Get();

        var patientList = response.Models;
        var ids = patientList.Select(p => (object)p.PatientId.ToString()).ToList();
        var now = DateTime.UtcNow;

        var latestByPatient = new Dictionary<Guid, VitalRecord>();
        var alertsByPatient = new Dictionary<Guid, List<Alert>>();

        if (ids.Count > 0)
        {
            var vitalsResp = await _supabase
                .From<VitalRecord>()
                .Filter("patient_id", Postgrest.Constants.Operator.In, ids)
                .Filter("recorded_at", Postgrest.Constants.Operator.GreaterThanOrEqual,
                        now.AddHours(-24).ToString("o"))
                .Order(x => x.RecordedAt, Postgrest.Constants.Ordering.Descending)
                .Get();

            foreach (var v in vitalsResp.Models)
                latestByPatient.TryAdd(v.PatientId, v); // newest-first, so first wins

            var alertsResp = await _supabase
                .From<Alert>()
                .Filter("patient_id", Postgrest.Constants.Operator.In, ids)
                .Filter("is_active", Postgrest.Constants.Operator.Equals, "true")
                .Get();

            alertsByPatient = alertsResp.Models
                .GroupBy(a => a.PatientId)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        var patients = patientList.Select(p => new
        {
            patientId = p.PatientId,
            name = p.Name,
            age = p.Age,
            avatarUrl = p.AvatarUrl,
            status = p.Status,
            statusSummary = PatientStatusCalculator.Compute(
                latestByPatient.GetValueOrDefault(p.PatientId),
                alertsByPatient.GetValueOrDefault(p.PatientId) ?? new List<Alert>(),
                now)
        }).ToList();

        return Ok(patients);
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An error occurred while retrieving patients." });
    }
}

    /// <summary>
    /// Returns a condensed summary of the selected patient's 100 most recent
    /// vital records. Recorded extrema are not clinical classifications.
    /// </summary>
    [HttpGet("{patientId}/vitals/summary")]
    [RequirePermission(RbacPermissions.RecordsRead)]
    [ProducesResponseType(typeof(VitalsSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<VitalsSummaryResponse>> GetVitalsSummary(
        string patientId)
    {
        if (!Guid.TryParse(patientId, out var id))
        {
            return BadRequest(new { message = "Invalid patient ID." });
        }

        try
        {
            var summary = await _clinicalRules.GetVitalsSummaryAsync(
                id,
                HttpContext.RequestAborted);
            return Ok(summary);
        }
        catch (Exception)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving the patient vital summary."
            });
        }
    }

    [HttpGet("{patientId}")]
    [RequirePermission(RbacPermissions.PatientsRead)]
    public async Task<IActionResult> GetPatient(string patientId)
    {
        if (!Guid.TryParse(patientId, out var id))
        {
            return BadRequest(new { message = "Invalid patient ID." });
        }
        try
        {
        var response = await _supabase
            .From<Patient>()
            .Where(x => x.PatientId == id)
            .Get();

        var patient = response.Models.FirstOrDefault();

        if (patient == null)
        {
            return NotFound("Patient not found.");
        }

        return Ok(new
        {
            patientId = patient.PatientId,
            name = patient.Name,
            age = patient.Age,
            status = patient.Status,
            createdAt = patient.CreatedAt
        });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the patient.", error = ex.Message });
        }
    }
}
