
using Postgrest.Attributes;
using Postgrest.Models;

namespace backend.Models;

[Table("profiles")]
public class UserProfile : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

   [Column("avatar_url", NullValueHandling = Newtonsoft.Json.NullValueHandling.Include)]
public string? AvatarUrl { get; set; }

    [Column("role")]
    public string Role { get; set; } = "user";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
