using Postgrest.Attributes;
using Postgrest.Models;

namespace backend.Models;

[Table("profiles")]
public class StaffUser : BaseModel
{
    [PrimaryKey("id", true)]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string DisplayName { get; set; } = string.Empty;

    [Column("role")]
    public string Role { get; set; } = "user";

    [Column("is_active")]
    public bool IsActive { get; set; } = true;
}