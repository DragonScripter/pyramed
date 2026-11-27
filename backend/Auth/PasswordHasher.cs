namespace PyraMed.Api.Auth;


public interface IPasswordHasher
{
    string Hash(string plain);
    bool Verify(string plain, string hash);
}

public class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string plain) =>
        BCrypt.Net.BCrypt.HashPassword(plain, WorkFactor);

    public bool Verify(string plain, string hash)
    {
        try { return BCrypt.Net.BCrypt.Verify(plain, hash); }
        catch (BCrypt.Net.SaltParseException) { return false; } 
    }
}