using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Protocols;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using backend.BackgroundWorkers;
using backend.Services;
using backend.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Fetch Supabase keys from appsettings.json
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? "";
var supabaseKey = builder.Configuration["Supabase:Key"] ?? "";

// Register the Supabase client
builder.Services.AddScoped(provider =>
    new Supabase.Client(
        supabaseUrl,
        supabaseKey,
        new Supabase.SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = true
        }));

builder.Services.AddScoped<ClinicalRules>();
builder.Services.AddScoped<OperationsMetricsService>();
builder.Services.AddHttpClient<IClinicalSummaryGenerator, OpenAiClinicalSummaryGenerator>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddControllers();


 // Issue #45: Validate Supabase Auth access tokens
var supabaseIssuer = $"{supabaseUrl.TrimEnd('/')}/auth/v1";
var jwksUrl = $"{supabaseIssuer}/.well-known/jwks.json";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = true;
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = supabaseIssuer,

            ValidateAudience = true,
            ValidAudience = "authenticated",

            ValidateLifetime = true,
            RequireExpirationTime = true,

            ValidateIssuerSigningKey = true,
            RequireSignedTokens = true,

            ValidAlgorithms = new[] { SecurityAlgorithms.EcdsaSha256 },

            NameClaimType = "sub"
        };

        options.ConfigurationManager =
            new ConfigurationManager<
                Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectConfiguration>(
                jwksUrl,
                new SupabaseJwksConfigurationRetriever(),
                new HttpDocumentRetriever
                {
                    RequireHttps = true
                });
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(StaffPermissions.UsersRead, policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.AddRequirements(
            new StaffPermissionRequirement(StaffPermissions.UsersRead));
    });

    options.AddPolicy(StaffPermissions.UsersWrite, policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.AddRequirements(
            new StaffPermissionRequirement(StaffPermissions.UsersWrite));
    });
});

builder.Services.AddScoped<
    IAuthorizationHandler,
    StaffPermissionHandler>();

// Ticket 13: C# Asynchronous Patient Monitoring Engine
builder.Services.AddHostedService<VitalSimulator>();
//Ticket10
builder.Services.AddSingleton<backend.Services.CdsValidationEngine>();
builder.Services.AddScoped<IBodyCompositionService, BodyCompositionService>();

// Configure CORS for React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
//testing for ticket 49
// if (app.Environment.IsDevelopment())
// {
//     app.Use(async (ctx, next) =>
//     {
//         if (ctx.Request.Headers.TryGetValue("X-Dev-Role", out var role))
//         {
//             ctx.User = new System.Security.Claims.ClaimsPrincipal(
//                 new System.Security.Claims.ClaimsIdentity(
//                     new[] { new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, role.ToString()) },
//                     "dev"));
//         }
//         await next();
//     });
// }

// Configure the HTTP request pipeline
app.UseHttpsRedirection();


app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.MapGet("/", () =>
    "PyraMed Core Backend API is live and connected!");

app.Run();
