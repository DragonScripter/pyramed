using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class UpdateStaffUserActiveRequest
{
    [Required]
    public bool? IsActive { get; set; }
}