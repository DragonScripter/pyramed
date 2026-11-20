
using Supabase.Gotrue;

namespace backend.Services;

public class AuthService
{
    private readonly string _authUrl;

    public AuthService(IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"]
            ?? throw new InvalidOperationException(
                "Supabase URL is not configured.");

        _authUrl = $"{supabaseUrl.TrimEnd('/')}/auth/v1";
    }

    public async Task<Session?> LoginAsync(
        string email,
        string password)
    {
        var client = new StatelessClient();

        var options = new StatelessClient.StatelessClientOptions
        {
            Url = _authUrl
        };

        return await client.SignIn(
            email,
            password,
            options);
    }

public async Task LogoutAsync(string accessToken)
{
    var client = new StatelessClient();

    var options = new StatelessClient.StatelessClientOptions
    {
        Url = _authUrl
    };

    await client.SignOut(accessToken, options);
}

}
