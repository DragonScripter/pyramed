using System.Globalization;
using System.Security.Claims;
using backend.Audit;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

public sealed class PatientAuditFilterTests : IDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private readonly AuditDbContext _db;
    private readonly AuditLogRepository _repository;
    private readonly StaffUser _staff = new()
    {
        Id = Guid.Parse("96c76346-9d44-4502-a7fc-4e8bf10de8f1"),
        DisplayName = "Dr. Lee",
        Role = "provider",
        IsActive = true
    };

    public PatientAuditFilterTests()
    {
        _connection.Open();
        _db = new AuditDbContext(
            new DbContextOptionsBuilder<AuditDbContext>()
                .UseSqlite(_connection)
                .Options);
        _db.Database.EnsureCreated();
        _repository = new AuditLogRepository(_db);
    }

    [Fact]
    public async Task Successful_patient_view_writes_actor_patient_and_utc_entry()
    {
        var patientId = Guid.Parse("bcd26044-aa53-4c49-aec3-89596e90b13b");
        var context = CreateContext(HttpMethods.Get, patientId);

        await CreateFilter().OnActionExecutionAsync(
            context,
            Returns(context, new OkObjectResult(new { patientId })));

        var entry = await _db.AuditLog.SingleAsync();
        Assert.Equal(_staff.Id.ToString(), entry.UserId);
        Assert.Equal(_staff.DisplayName, entry.UserName);
        Assert.Equal(_staff.Role, entry.UserRole);
        Assert.Equal(patientId.ToString(), entry.PatientId);
        Assert.Equal(AuditAction.View, entry.Action);
        Assert.Equal("[]", entry.ChangedFieldsJson);

        Assert.True(DateTimeOffset.TryParse(
            entry.TimestampUtc,
            CultureInfo.InvariantCulture,
            DateTimeStyles.RoundtripKind,
            out var timestamp));
        Assert.Equal(TimeSpan.Zero, timestamp.Offset);
    }

    [Fact]
    public async Task Successful_patient_edit_writes_edit_entry_from_response_patient_id()
    {
        var patientId = Guid.Parse("e672fdad-cfdc-44aa-9d3d-d54674a2f4f7");
        var context = CreateContext(HttpMethods.Post);

        await CreateFilter().OnActionExecutionAsync(
            context,
            Returns(context, new OkObjectResult(new { patientId })));

        var entry = await _db.AuditLog.SingleAsync();
        Assert.Equal(patientId.ToString(), entry.PatientId);
        Assert.Equal(AuditAction.Edit, entry.Action);
    }

    [Fact]
    public async Task Patient_list_view_writes_one_entry_for_each_returned_patient()
    {
        var firstPatientId = Guid.Parse("f09f42ba-f7fe-4b3b-9ff9-a9e7b427c7c6");
        var secondPatientId = Guid.Parse("8d2d49df-0bb6-4cf9-a8d7-e3e42caa1fd7");
        var context = CreateContext(HttpMethods.Get);

        await CreateFilter().OnActionExecutionAsync(
            context,
            Returns(context, new OkObjectResult(new[]
            {
                new { patientId = firstPatientId },
                new { patientId = secondPatientId }
            })));

        var entries = await _db.AuditLog.ToListAsync();
        Assert.Equal(2, entries.Count);
        Assert.Contains(entries, entry =>
            entry.PatientId == firstPatientId.ToString() &&
            entry.Action == AuditAction.View);
        Assert.Contains(entries, entry =>
            entry.PatientId == secondPatientId.ToString() &&
            entry.Action == AuditAction.View);
    }

    [Fact]
    public async Task Audit_write_failure_replaces_success_response_with_503()
    {
        var patientId = Guid.Parse("dc7b9a1a-31b9-4c46-b1d2-4f5672c3f02b");
        var context = CreateContext(HttpMethods.Get, patientId);
        var filter = CreateFilter(new ThrowingAuditLogRepository());
        ActionExecutedContext? executedContext = null;

        await filter.OnActionExecutionAsync(
            context,
            () =>
            {
                executedContext = new ActionExecutedContext(
                    context,
                    new List<IFilterMetadata>(),
                    controller: new object())
                {
                    Result = new OkObjectResult(new { patientId })
                };
                return Task.FromResult(executedContext);
            });

        var result = Assert.IsType<ObjectResult>(executedContext!.Result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, result.StatusCode);
        Assert.Empty(await _db.AuditLog.ToListAsync());
    }

    private PatientAuditFilter CreateFilter(IAuditLogRepository? repository = null) =>
        new(
            repository ?? _repository,
            new FakeStaffUserResolver(_staff),
            NullLogger<PatientAuditFilter>.Instance);

    private ActionExecutingContext CreateContext(string method, Guid? patientId = null)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Method = method;
        httpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(
                [new Claim("sub", _staff.Id.ToString())],
                authenticationType: "test"));

        var routeData = new RouteData();
        if (patientId.HasValue)
        {
            routeData.Values["patientId"] = patientId.Value.ToString();
        }

        return new ActionExecutingContext(
            new ActionContext(httpContext, routeData, new ActionDescriptor()),
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>(),
            controller: new object());
    }

    private static ActionExecutionDelegate Returns(
        ActionExecutingContext context,
        IActionResult result) =>
        () => Task.FromResult(new ActionExecutedContext(
            context,
            new List<IFilterMetadata>(),
            controller: new object())
        {
            Result = result
        });

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private sealed class FakeStaffUserResolver(StaffUser staff) : IStaffUserResolver
    {
        public Task<StaffUser?> FindByIdAsync(Guid userId, CancellationToken ct = default) =>
            Task.FromResult<StaffUser?>(userId == staff.Id ? staff : null);
    }

    private sealed class ThrowingAuditLogRepository : IAuditLogRepository
    {
        public Task<AuditLogEntry> AppendAsync(
            AuditAppendRequest request,
            CancellationToken ct = default) =>
            throw new InvalidOperationException("Audit storage is unavailable.");

        public Task<AuditLogEntry?> GetAsync(long id, CancellationToken ct = default) =>
            Task.FromResult<AuditLogEntry?>(null);

        public Task<IReadOnlyList<AuditLogEntry>> ListForPatientAsync(
            string patientId,
            int limit = 100,
            int offset = 0,
            CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<AuditLogEntry>>([]);

        public Task<ChainVerification> VerifyChainAsync(CancellationToken ct = default) =>
            Task.FromResult(new ChainVerification(true, null));
    }
}
