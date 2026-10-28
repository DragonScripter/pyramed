
using backend.BackgroundWorkers;
using backend.Services;

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
builder.Services.AddHttpClient<IClinicalSummaryGenerator, OpenAiClinicalSummaryGenerator>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddControllers();

// Ticket 13: C# Asynchronous Patient Monitoring Engine
builder.Services.AddHostedService<VitalSimulator>();
//Ticket10
builder.Services.AddSingleton<backend.Services.CdsValidationEngine>();

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

// Configure the HTTP request pipeline
app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () =>
    "PyraMed Core Backend API is live and connected!");

app.Run();
