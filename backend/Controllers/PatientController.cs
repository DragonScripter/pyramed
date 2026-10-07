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