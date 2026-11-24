
using Supabase.Gotrue;

namespace backend.Services;

public class AuthService
{
    private readonly string _authUrl;
    private readonly string _supabaseKey;

    public AuthService(IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"]
            ?? throw new InvalidOperationException(
                "Supabase URL is not configured.");

                _authUrl = $"{supabaseUrl.TrimEnd('/')}/auth/v1";

        _supabaseKey = configuration["Supabase:Key"]
            ?? throw new InvalidOperationException(
                "Supabase API key is not configured.");
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

        options.Headers.Add("apikey", _supabaseKey);

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

        options.Headers.Add("apikey", _supabaseKey);

        await client.SignOut(accessToken, options);
    }
}
