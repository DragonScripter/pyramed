using PyraMed.Api.Models;

namespace backend.Services;

public static class VitalAccessor
{
    private static readonly Dictionary<string, Func<VitalRecord, double>> Readers =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["HeartRate"] = v => v.HeartRate,
            ["SpO2"]      = v => v.SpO2,
            // Add more as VitalRecord has them, e.g.:
            // ["Temperature"] = v => v.Temperature,
        };

    public static IEnumerable<string> Names => Readers.Keys;

    public static bool IsKnown(string name) => Readers.ContainsKey(name);

    public static double Read(VitalRecord vitals, string name) => Readers[name](vitals);
}