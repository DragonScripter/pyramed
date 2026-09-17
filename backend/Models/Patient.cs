using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models
{
    [Table("patients")]
    public class Patient : BaseModel
    {
        [PrimaryKey("patient_id", false)]
        public Guid PatientId { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("age")]
        public int Age { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Admitted";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}