using System.ComponentModel.DataAnnotations;

namespace PyraMed.Api.Models;

public enum RuleOperator
{
    LessThan,
    LessThanOrEqual,
    GreaterThan,
    GreaterThanOrEqual,
    Equal
}

public sealed class ClinicalRule
{
    public Guid Id { get; set; }
    [Required, StringLength(50, MinimumLength = 1)]
    public string VitalName { get; set; } = string.Empty;   // e.g. "HeartRate"

    [Required, EnumDataType(typeof(RuleOperator))]
    public RuleOperator? Operator { get; set; }

    [Required]
    public double? Threshold { get; set; }

    [Required, StringLength(500, MinimumLength = 1)]
    public string AdvisoryText { get; set; } = string.Empty; // e.g. "Bradycardia"

    // Optional scoring fields (defaults keep the minimal payload valid)
    [StringLength(50)]
    public string? Code { get; set; }                        // tag used by the composite rule

    [Range(0, 100)]
    public int BasePoints { get; set; } = 20;                // risk points when the rule fires

    [Range(0, 100)]
    public double SeverityMultiplier { get; set; } = 1;      // extra points per unit past threshold

    [Range(0, 100)]
    public int MaxSeverityPoints { get; set; } = 20;         // cap on the severity bonus

    public bool IsTriggeredBy(double value) => Operator switch
    {
        RuleOperator.LessThan => value < Threshold,
        RuleOperator.LessThanOrEqual => value <= Threshold,
        RuleOperator.GreaterThan => value > Threshold,
        RuleOperator.GreaterThanOrEqual => value >= Threshold,
        RuleOperator.Equal => value == Threshold,
        _ => false
    };

    public double SeverityDistance(double value) =>
        Math.Abs(value - Threshold!.Value);
}