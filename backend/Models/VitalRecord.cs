using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models
{
    [Table("vitals")]
    public class VitalRecord : BaseModel
    {
        [PrimaryKey("vital_id", false)]
        public string VitalId { get; set; } = string.Empty;

        [Column("patient_id")]
        public string PatientId { get; set; } = string.Empty;

        [Column("heart_rate")]
        public int HeartRate { get; set; }

        [Column("spo2")]
        public int SpO2 { get; set; }

        [Column("recorded_at")]
        public DateTime RecordedAt { get; set; }
    }
}
