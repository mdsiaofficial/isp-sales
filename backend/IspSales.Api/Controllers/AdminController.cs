using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IspSales.Api.Data;
using IspSales.Api.DTOs;
using IspSales.Api.Models;

namespace IspSales.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalOrders = await _context.CustomerOrders.CountAsync();
        var pendingOrders = await _context.CustomerOrders.CountAsync(o => o.Status == OrderStatus.PENDING);
        var completedConnections = await _context.CustomerOrders.CountAsync(o => o.Status == OrderStatus.CONNECTED);
        var totalAgents = await _context.Users.CountAsync(u => u.Role == UserRole.SalesAgent);
        var totalLeads = await _context.FutureLeads.CountAsync();
        var totalCallbacks = await _context.CallbackRequests.CountAsync();

        return Ok(new DashboardStatsResponse(
            totalOrders,
            pendingOrders,
            completedConnections,
            totalAgents,
            totalLeads,
            totalCallbacks
        ));
    }

    // Packages Management
    [HttpGet("packages")]
    public async Task<IActionResult> GetAllPackages()
    {
        var packages = await _context.InternetPackages.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(packages);
    }

    [HttpPost("packages")]
    public async Task<IActionResult> CreatePackage([FromBody] CreatePackageRequest request)
    {
        var package = new InternetPackage
        {
            Name = request.Name,
            SpeedMbps = request.SpeedMbps,
            MonthlyPrice = request.MonthlyPrice,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.InternetPackages.Add(package);
        await _context.SaveChangesAsync();
        return Ok(package);
    }

    [HttpPut("packages/{id}")]
    public async Task<IActionResult> UpdatePackage(Guid id, [FromBody] UpdatePackageRequest request)
    {
        var package = await _context.InternetPackages.FindAsync(id);
        if (package == null) return NotFound(new { message = "Package not found." });

        package.Name = request.Name;
        package.SpeedMbps = request.SpeedMbps;
        package.MonthlyPrice = request.MonthlyPrice;
        package.Description = request.Description;
        package.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return Ok(package);
    }

    [HttpDelete("packages/{id}")]
    public async Task<IActionResult> DeletePackage(Guid id)
    {
        var package = await _context.InternetPackages.FindAsync(id);
        if (package == null) return NotFound(new { message = "Package not found." });

        // Check if referenced in orders
        var hasOrders = await _context.CustomerOrders.AnyAsync(o => o.PackageId == id);
        if (hasOrders)
        {
            // Soft delete by deactivating
            package.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Package is linked to existing orders. Deactivated instead of removed." });
        }

        _context.InternetPackages.Remove(package);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Package deleted successfully." });
    }

    // Coverage Areas Management
    [HttpGet("coverage-areas")]
    public async Task<IActionResult> GetAllCoverageAreas()
    {
        var cities = await _context.Cities
            .Include(c => c.CoverageAreas)
            .OrderBy(c => c.Name)
            .ToListAsync();
        return Ok(cities);
    }

    [HttpPost("cities")]
    public async Task<IActionResult> CreateCity([FromBody] CreateCityRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "City name is required." });

        var exists = await _context.Cities.AnyAsync(c => c.Name.ToLower() == request.Name.ToLower());
        if (exists) return BadRequest(new { message = "City already exists." });

        var city = new City { Name = request.Name.Trim() };
        _context.Cities.Add(city);
        await _context.SaveChangesAsync();
        return Ok(city);
    }

    [HttpPost("coverage-areas")]
    public async Task<IActionResult> CreateCoverageArea([FromBody] CreateAreaRequest request)
    {
        var city = await _context.Cities.FindAsync(request.CityId);
        if (city == null) return NotFound(new { message = "City not found." });

        var area = new CoverageArea
        {
            CityId = request.CityId,
            Name = request.Name.Trim(),
            IsActive = true
        };

        _context.CoverageAreas.Add(area);
        await _context.SaveChangesAsync();
        return Ok(area);
    }

    [HttpPut("coverage-areas/{id}")]
    public async Task<IActionResult> UpdateCoverageArea(Guid id, [FromBody] UpdateAreaRequest request)
    {
        var area = await _context.CoverageAreas.FindAsync(id);
        if (area == null) return NotFound(new { message = "Coverage area not found." });

        area.Name = request.Name.Trim();
        area.IsActive = request.IsActive;
        await _context.SaveChangesAsync();
        return Ok(area);
    }

    [HttpDelete("coverage-areas/{id}")]
    public async Task<IActionResult> DeleteCoverageArea(Guid id)
    {
        var area = await _context.CoverageAreas.FindAsync(id);
        if (area == null) return NotFound(new { message = "Coverage area not found." });

        var hasOrders = await _context.CustomerOrders.AnyAsync(o => o.CoverageAreaId == id);
        if (hasOrders)
        {
            area.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Area linked to orders; deactivated instead of deleted." });
        }

        _context.CoverageAreas.Remove(area);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Coverage area deleted successfully." });
    }

    // Sales Agent Management
    [HttpGet("agents")]
    public async Task<IActionResult> GetAgents()
    {
        var agents = await _context.Users
            .Where(u => u.Role == UserRole.SalesAgent)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.FullName,
                u.IsActive,
                u.CreatedAt
            })
            .ToListAsync();
        return Ok(agents);
    }

    [HttpPost("agents")]
    public async Task<IActionResult> CreateAgent([FromBody] CreateAgentRequest request)
    {
        var exists = await _context.Users.AnyAsync(u =>
            u.Username.ToLower() == request.Username.ToLower() ||
            u.Email.ToLower() == request.Email.ToLower());

        if (exists) return BadRequest(new { message = "Username or email is already taken." });

        var agent = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.SalesAgent,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(agent);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            agent.Id,
            agent.Username,
            agent.Email,
            agent.FullName,
            agent.IsActive,
            agent.CreatedAt
        });
    }

    [HttpPut("agents/{id}")]
    public async Task<IActionResult> UpdateAgent(Guid id, [FromBody] UpdateAgentRequest request)
    {
        var agent = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.SalesAgent);
        if (agent == null) return NotFound(new { message = "Agent not found." });

        agent.FullName = request.FullName.Trim();
        agent.Email = request.Email.Trim();
        agent.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            agent.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Agent updated successfully." });
    }

    // Orders (Admin View)
    [HttpGet("orders")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.CustomerOrders
            .Include(o => o.City)
            .Include(o => o.CoverageArea)
            .Include(o => o.Package)
            .Include(o => o.AssignedAgent)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.CustomerName,
                o.CustomerPhone,
                o.CustomerAddress,
                City = o.City != null ? o.City.Name : "",
                CoverageArea = o.CoverageArea != null ? o.CoverageArea.Name : "",
                PackageName = o.Package != null ? o.Package.Name : "",
                PackageSpeed = o.Package != null ? o.Package.SpeedMbps : 0,
                PackagePrice = o.Package != null ? o.Package.MonthlyPrice : 0,
                Status = o.Status.ToString(),
                AgentName = o.AssignedAgent != null ? o.AssignedAgent.FullName : null,
                o.Notes,
                o.CreatedAt,
                o.UpdatedAt
            })
            .ToListAsync();

        return Ok(orders);
    }

    // Callbacks
    [HttpGet("callbacks")]
    public async Task<IActionResult> GetCallbacks()
    {
        var callbacks = await _context.CallbackRequests
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
        return Ok(callbacks);
    }

    [HttpPatch("callbacks/{id}/status")]
    public async Task<IActionResult> UpdateCallbackStatus(Guid id, [FromBody] string status)
    {
        var callback = await _context.CallbackRequests.FindAsync(id);
        if (callback == null) return NotFound();
        callback.Status = status;
        await _context.SaveChangesAsync();
        return Ok(callback);
    }

    // Future Leads
    [HttpGet("leads")]
    public async Task<IActionResult> GetLeads()
    {
        var leads = await _context.FutureLeads
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
        return Ok(leads);
    }
}
