using PyraMed.Api.Auth;
using Xunit;

namespace backend.Tests;

public class PasswordHasherTests
{
    private readonly BCryptPasswordHasher _h = new();

    [Fact]
    public void Correct_password_verifies() =>
        Assert.True(_h.Verify("Secret123!", _h.Hash("Secret123!")));

    [Fact]
    public void Wrong_password_fails() =>
        Assert.False(_h.Verify("nope", _h.Hash("Secret123!")));

    [Fact]
    public void Hash_is_not_plaintext() =>
        Assert.NotEqual("Secret123!", _h.Hash("Secret123!"));

    [Fact]
    public void Hashes_are_salted() =>
        Assert.NotEqual(_h.Hash("Secret123!"), _h.Hash("Secret123!"));

    [Fact]
    public void Malformed_hash_returns_false() =>
        Assert.False(_h.Verify("x", "not-a-hash"));
    
        
}
