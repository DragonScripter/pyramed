using System.Collections.Concurrent;
using System.Collections.Immutable;
using PyraMed.Api.Models;

namespace backend.Services;

public interface IClinicalRuleStore
{
    ClinicalRule Add(ClinicalRule rule);
    IReadOnlyList<ClinicalRule> GetRulesFor(string vitalName);
    IReadOnlyList<ClinicalRule> GetAll();
}

public sealed class ClinicalRuleStore : IClinicalRuleStore
{
    private readonly ConcurrentDictionary<string, ImmutableList<ClinicalRule>> _rules =
        new(StringComparer.OrdinalIgnoreCase);

    public ClinicalRuleStore()
    {
        // Seed with the rules that used to be hardcoded in CdsValidationEngine
        Add(new ClinicalRule
        {
            Code = "TACHYCARDIA",
            VitalName = "HeartRate",
            Operator = RuleOperator.GreaterThan,
            Threshold = 110,
            AdvisoryText = "Tachycardia",
            BasePoints = 20,
            SeverityMultiplier = 1,
            MaxSeverityPoints = 20
        });

        Add(new ClinicalRule
        {
            Code = "HYPOXIA",
            VitalName = "SpO2",
            Operator = RuleOperator.LessThan,
            Threshold = 92,
            AdvisoryText = "Hypoxia",
            BasePoints = 20,
            SeverityMultiplier = 4,
            MaxSeverityPoints = 20
        });
    }

    public ClinicalRule Add(ClinicalRule rule)
    {
        rule.Id = Guid.NewGuid();

        _rules.AddOrUpdate(
            rule.VitalName,
            _ => ImmutableList.Create(rule),
            (_, existing) => existing.Add(rule));

        return rule;
    }

    public IReadOnlyList<ClinicalRule> GetRulesFor(string vitalName) =>
        _rules.TryGetValue(vitalName, out var list)
            ? list
            : ImmutableList<ClinicalRule>.Empty;

    public IReadOnlyList<ClinicalRule> GetAll() =>
        _rules.Values.SelectMany(l => l).ToList();
}