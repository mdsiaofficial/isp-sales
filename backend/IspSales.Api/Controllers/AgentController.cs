using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IspSales.Api.Data;
using IspSales.Api.DTOs;
using IspSales.Api.Models;

namespace IspSales.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SalesAgent,Admin")]
public class AgentController : ControllerBase
{
    private readonly AppDbContext _context;

    public AgentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = _context.CustomerOrders
            .Include(o => o.CoverageArea)
            .Include(o => o.Package)
            .Include(o => o.AssignedAgent)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(o =>
                o.CustomerName.ToLower().Contains(s) ||
                o.CustomerPhone.ToLower().Contains(s) ||
                o.OrderNumber.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        return Ok(new PagedResult<object>(orders, total, page, pageSize));
    }

    [HttpPatch("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _context.CustomerOrders.FindAsync(id);
        if (order == null) return NotFound(new { message = "Order not found." });

        order.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            order.Notes = request.Notes;
        }
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new
        {
            order.Id,
            order.OrderNumber,
            Status = order.Status.ToString(),
            order.Notes,
            order.UpdatedAt
        });
    }
}
