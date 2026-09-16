var builder = WebApplication.CreateBuilder(args);

// Fetch Supabase keys from appsettings.json
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? "";
var supabaseKey = builder.Configuration["Supabase:Key"] ?? "";
// Register the Supabase client as a shared service across your backend
builder.Services.AddScoped(provider => 
    new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = true
    }));
builder.Services.AddControllers();


var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


app.MapGet("/", () => "PyraMed Core Backend API is live and connected!");

app.Run();

