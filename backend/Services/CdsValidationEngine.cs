using PyraMed.Api.Models;
using PyraMed.Api.Dtos;
namespace backend.Services;

public class CdsValidationEngine
{
    private readonly IClinicalRuleStore _store;

    public CdsValidationEngine(IClinicalRuleStore store) => _store = store;

    public CdsEvaluationDto Evaluate(VitalRecord vitals)
    {
        var result = new CdsEvaluationDto();
        int score = 0;
        var triggeredCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var vitalName in VitalAccessor.Names)
        {
            double value = VitalAccessor.Read(vitals, vitalName);

            foreach (var rule in _store.GetRulesFor(vitalName))
            {
                if (!rule.IsTriggeredBy(value)) continue;

                int severity = (int)Math.Min(
                    rule.MaxSeverityPoints,
                    rule.SeverityDistance(value) * rule.SeverityMultiplier);

                score += rule.BasePoints + severity;
                result.Warnings.Add($"{rule.AdvisoryText}: {vitalName} = {value}");

                if (rule.Code is not null) triggeredCodes.Add(rule.Code);
            }
        }

        // Composite rule: both breached simultaneously
        if (triggeredCodes.Contains("TACHYCARDIA") && triggeredCodes.Contains("HYPOXIA"))
        {
            score += 20;
            result.Warnings.Add(
                "Warning: Telemetry matches high-probability Early Tachycardia / Hypoxia profile. " +
                "Recommend immediate respiratory assessment.");
        }

        result.RiskScore = Math.Min(score, 100);
        result.RiskLevel = result.RiskScore >= 70 ? "High"
                         : result.RiskScore >= 30 ? "Moderate"
                         : "Low";
        return result;
    }
}