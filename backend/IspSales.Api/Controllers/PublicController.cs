using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IspSales.Api.Data;
using IspSales.Api.DTOs;
using IspSales.Api.Models;

namespace IspSales.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicController : ControllerBase
{
    private readonly AppDbContext _context;

    public PublicController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("packages")]
    public async Task<IActionResult> GetActivePackages()
    {
        var packages = await _context.InternetPackages
            .Where(p => p.IsActive)
            .OrderBy(p => p.MonthlyPrice)
            .ToListAsync();
        return Ok(packages);
    }

    [HttpGet("coverage-areas")]
    public async Task<IActionResult> GetCoverageAreas()
    {
        var cities = await _context.Cities
            .Include(c => c.CoverageAreas.Where(a => a.IsActive))
            .ToListAsync();

        var result = cities.Select(c => new
        {
            c.Id,
            c.Name,
            Areas = c.CoverageAreas.Select(a => new { a.Id, a.Name }).ToList()
        });

        return Ok(result);
    }

    [HttpPost("chatbot/order")]
    public async Task<IActionResult> CreateChatbotOrder([FromBody] ChatbotOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) ||
            string.IsNullOrWhiteSpace(request.CustomerPhone) ||
            string.IsNullOrWhiteSpace(request.CustomerAddress))
        {
            return BadRequest(new { message = "Name, phone number, and address are required." });
        }

        var city = await _context.Cities.FindAsync(request.CityId);
        var area = await _context.CoverageAreas.FindAsync(request.CoverageAreaId);
        var package = await _context.InternetPackages.FindAsync(request.PackageId);

        if (city == null || area == null || package == null)
        {
            return BadRequest(new { message = "Invalid city, area, or internet package selected." });
        }

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        var order = new CustomerOrder
        {
            OrderNumber = orderNumber,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerAddress = request.CustomerAddress.Trim(),
            CityId = request.CityId,
            CoverageAreaId = request.CoverageAreaId,
            PackageId = request.PackageId,
            Status = OrderStatus.PENDING,
            CreatedAt = DateTime.UtcNow
        };

        _context.CustomerOrders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            orderId = order.Id,
            orderNumber = order.OrderNumber,
            message = "Order successfully created! A sales agent will contact you shortly.",
            status = order.Status.ToString()
        });
    }

    [HttpPost("chatbot/callback")]
    public async Task<IActionResult> RequestCallback([FromBody] ChatbotCallbackRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            return BadRequest(new { message = "Customer name and phone number are required." });
        }

        var callback = new CallbackRequest
        {
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            Status = "PENDING",
            CreatedAt = DateTime.UtcNow
        };

        _context.CallbackRequests.Add(callback);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Thank you! Our sales representative will call you back shortly.",
            id = callback.Id
        });
    }

    [HttpPost("chatbot/lead")]
    public async Task<IActionResult> SaveFutureLead([FromBody] ChatbotLeadRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) ||
            string.IsNullOrWhiteSpace(request.CustomerPhone) ||
            string.IsNullOrWhiteSpace(request.AreaName))
        {
            return BadRequest(new { message = "Name, phone number, and area name are required." });
        }

        var lead = new FutureLead
        {
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CityName = request.CityName?.Trim() ?? "Other",
            AreaName = request.AreaName.Trim(),
            Status = "NEW",
            CreatedAt = DateTime.UtcNow
        };

        _context.FutureLeads.Add(lead);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "We currently don't cover your area yet, but your interest has been saved! We will notify you when coverage expands.",
            id = lead.Id
        });
    }
}
