using Microsoft.AspNetCore.Mvc;
using PyraMed.Api.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/patient")]
public class PatientController : ControllerBase
{
    private readonly Supabase.Client _supabase;

    public PatientController(Supabase.Client supabase)
    {
        _supabase = supabase;
    }

    public class CreatePatientRequest
    {
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
    }

    [HttpPost]
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

        var createdPatient = response.Models.FirstOrDefault();

        if (createdPatient == null)
        {
            return StatusCode(500, "Patient could not be created.");
        }

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
    public async Task<IActionResult> GetPatients(
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
        if (limit < 1 || limit > 100 || offset < 0)
        {
            return BadRequest(new
            {
                message = "Limit must be between 1 and 100, and offset cannot be negative."
            });
        }

        try
        {
           var response = await _supabase
    .From<Patient>()
    .Order(x => x.PatientId, Postgrest.Constants.Ordering.Ascending)
    .Range(offset, offset + limit - 1)
    .Get();

            var patients = response.Models.Select(patient => new
            {
                patientId = patient.PatientId,
                name = patient.Name,
                status = patient.Status
            }).ToList();

            return Ok(patients);
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving patients."
            });
        }
    }

    [HttpGet("{patientId}")]
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