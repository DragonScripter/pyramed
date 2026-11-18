using Postgrest.Attributes;
using Postgrest.Models;

namespace PyraMed.Api.Models;
[Table("role_permissions")]
public class RolePermission : BaseModel
{
    [PrimaryKey("id", false)] public Guid Id { get; set; }
    [Column("role_id")] public Guid RoleId { get; set; }
    [Column("permission_id")] public Guid PermissionId { get; set; }
}