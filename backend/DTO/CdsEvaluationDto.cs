namespace PyraMed.Api.Dtos;

public class CdsEvaluationDto
{
    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public List<string> Warnings { get; set; } = new();
}