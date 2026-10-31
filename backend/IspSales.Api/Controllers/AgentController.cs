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
    public async Task<IActionResult> GetOrders([FromQuery] OrderStatus? status)
    {
        var query = _context.CustomerOrders
            .Include(o => o.City)
            .Include(o => o.CoverageArea)
            .Include(o => o.Package)
            .Include(o => o.AssignedAgent)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        var orders = await query
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
