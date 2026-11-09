using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models
{
    [Table("body_composition")]
    public class BodyCompositionRecord : BaseModel
    {
        [PrimaryKey("record_id", false)]
        public Guid RecordId { get; set; }

        [Column("patient_id")]
        public Guid PatientId { get; set; }

        [Column("measured_at")]
        public DateTime MeasuredAt { get; set; }

        [Column("bmi")]
        public decimal? Bmi { get; set; }

        [Column("body_fat_percent")]
        public decimal? BodyFatPercent { get; set; }

        [Column("muscle_mass_kg")]
        public decimal? MuscleMassKg { get; set; }

        [Column("created_at", ignoreOnInsert: true, ignoreOnUpdate: true)]
        public DateTime CreatedAt { get; set; }
    }
}