namespace backend.DTO;

public class StaffUserResponse
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public Guid RoleId { get; set; }

    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}