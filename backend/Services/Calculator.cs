using PyraMed.Api.Models;

namespace backend.Services;

public enum TriageLevel { Stable, Warning, Critical }

public record StatusSummary(string Level, IReadOnlyList<string> Reasons);

public static class PatientStatusCalculator
{
    private static readonly TimeSpan StaleAfter = TimeSpan.FromHours(24);

    public static StatusSummary Compute(VitalRecord? latest, IEnumerable<Alert> activeAlerts, DateTime nowUtc)
    {
        var level = TriageLevel.Stable;
        var reasons = new List<string>();

        void Raise(TriageLevel l, string reason)
        {
            if (l > level) level = l;
            reasons.Add(reason);
        }

        foreach (var a in activeAlerts)
            Raise(a.Severity.Equals("critical", StringComparison.OrdinalIgnoreCase)
                    ? TriageLevel.Critical : TriageLevel.Warning,
                  $"Active {a.Severity} alert");

        if (latest is null || nowUtc - latest.RecordedAt.ToUniversalTime() > StaleAfter)
        {
            Raise(TriageLevel.Warning, "No recent vitals");
        }
        else
        {
           var hr = latest.HeartRate;
            if (hr < 40 || hr > 130) Raise(TriageLevel.Critical, $"Heart rate {hr}");
            else if (hr < 50 || hr > 110) Raise(TriageLevel.Warning, $"Heart rate {hr}");

            var sp = latest.SpO2;
            if (sp < 90) Raise(TriageLevel.Critical, $"SpO2 {sp}%");
            else if (sp < 94) Raise(TriageLevel.Warning, $"SpO2 {sp}%");
        }

        return new StatusSummary(level.ToString(), reasons);
    }
}