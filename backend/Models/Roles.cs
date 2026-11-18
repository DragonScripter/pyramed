using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models;

[Table("roles")]
public class Role : BaseModel
{
    [PrimaryKey("role_id", false)] public Guid RoleId { get; set; }
    [Column("name")] public string Name { get; set; } = string.Empty;
    [Column("description")] public string? Description { get; set; }
    [Column("created_at", ignoreOnInsert: true, ignoreOnUpdate: true)] public DateTime CreatedAt { get; set; }
}