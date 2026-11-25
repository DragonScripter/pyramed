using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class UpdateStaffUserRoleRequest
{
    [Required]
    public Guid? RoleId { get; set; }
}