using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models
{
    [Table("vitals")]
    public class VitalRecord : BaseModel
    {
        [PrimaryKey("vital_id", false)]
        public Guid VitalId { get; set; }

        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("heart_rate")]
        public int HeartRate { get; set; }

        [Column("spo2")]
        public int SpO2 { get; set; }

        [Column("recorded_at")]
        public DateTime RecordedAt { get; set; }
    }
}