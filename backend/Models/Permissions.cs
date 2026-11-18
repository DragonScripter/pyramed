using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models;

[Table("permissions")]
public class Permission : BaseModel
{
    [PrimaryKey("permission_id", false)] public Guid PermissionId { get; set; }
    [Column("name")] public string Name { get; set; } = string.Empty;
    [Column("description")] public string? Description { get; set; }
}