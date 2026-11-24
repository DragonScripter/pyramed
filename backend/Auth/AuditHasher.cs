using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Pyramed.Audit;

public static class AuditHasher
{
    public const string GenesisHash =
        "0000000000000000000000000000000000000000000000000000000000000000";

    public static string Compute(
        string userId, string userName, string userRole, string patientId,
        AuditAction action, string timestampUtc, string changedFieldsJson, string prevHash)
    {
        var canonical = JsonSerializer.Serialize(new
        {
            userId, userName, userRole, patientId,
            action = action.ToString(),
            timestampUtc, changedFieldsJson, prevHash
        });
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();
    }
}