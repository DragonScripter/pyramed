namespace PyraMed.Api.Models;

public class User
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;   
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
}