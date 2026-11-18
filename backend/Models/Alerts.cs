using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models;

[Table("alerts")]
public class Alert : BaseModel
{
    [PrimaryKey("alert_id", false)] public Guid AlertId { get; set; }
    [Column("patient_id")] public Guid PatientId { get; set; }
    [Column("severity")] public string Severity { get; set; } = "warning";
    [Column("is_active")] public bool IsActive { get; set; }
    [Column("created_at", ignoreOnInsert: true, ignoreOnUpdate: true)] public DateTime CreatedAt { get; set; }
}