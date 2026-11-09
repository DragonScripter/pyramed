
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class UpdateUserProfileRequest
{
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Full name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Url(ErrorMessage = "Please provide a valid avatar URL.")]
    [StringLength(2048)]
    public string? AvatarUrl { get; set; }
}
