using backend.Services;
using Xunit;

namespace backend.Tests;

public class StaffUserSafetyRulesTests
{
    [Fact]
    public void IsSelfModification_ReturnsTrue_ForSameUser()
    {
        var userId = Guid.NewGuid();

        var result = StaffUserSafetyRules.IsSelfModification(
            userId, userId);

        Assert.True(result);
    }

    [Fact]
    public void IsSelfModification_ReturnsFalse_ForDifferentUsers()
    {
        var currentUserId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();

        var result = StaffUserSafetyRules.IsSelfModification(
            currentUserId, targetUserId);

        Assert.False(result);
    }

    [Fact]
    public void IsLastActiveAdministrator_ReturnsTrue_WhenOnlyOneRemains()
    {
        var result = StaffUserSafetyRules.IsLastActiveAdministrator(
            true, 1);

        Assert.True(result);
    }

    [Fact]
    public void IsLastActiveAdministrator_ReturnsFalse_WhenMultipleRemain()
    {
        var result = StaffUserSafetyRules.IsLastActiveAdministrator(
            true, 2);

        Assert.False(result);
    }
    [Fact]
public void IsLastActiveAdministrator_ReturnsFalse_ForRegularUser()
{
    var result = StaffUserSafetyRules.IsLastActiveAdministrator(
        false, 1);

    Assert.False(result);
}
}