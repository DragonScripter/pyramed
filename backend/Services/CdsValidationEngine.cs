using PyraMed.Api.Models;
using PyraMed.Api.Dtos;
namespace backend.Services;

public class CdsValidationEngine
{
    private const int HeartRateThreshold = 110;
    private const int SpO2Threshold = 92;

    public CdsEvaluationDto Evaluate(VitalRecord vitals)
    {
        var result = new CdsEvaluationDto();

        bool tachycardia = vitals.HeartRate > HeartRateThreshold;
        bool hypoxia = vitals.SpO2 < SpO2Threshold;

        int score = 0;
        if (tachycardia)
            score += 20 + Math.Min(20, vitals.HeartRate - HeartRateThreshold);
        if (hypoxia)
            score += 20 + Math.Min(20, (SpO2Threshold - vitals.SpO2) * 4);

        // Composite rule: both breached simultaneously
        if (tachycardia && hypoxia)
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