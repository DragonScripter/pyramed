using Microsoft.AspNetCore.Mvc;
using backend.Models;

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
}