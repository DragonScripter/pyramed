namespace backend.Services;

public static class StaffUserSafetyRules
{
    public static bool IsSelfModification(
        Guid authenticatedUserId,
        Guid targetUserId)
    {
        return authenticatedUserId == targetUserId;
    }

    public static bool IsLastActiveAdministrator(
        bool targetIsActiveAdministrator,
        int activeAdministratorCount)
    {
        return targetIsActiveAdministrator
            && activeAdministratorCount <= 1;
    }
}