using System.ComponentModel.DataAnnotations;
using IspSales.Api.Models;

namespace IspSales.Api.DTOs;

// Auth
public record LoginRequest(
    [Required, StringLength(100, MinimumLength = 1)] string Username,
    [Required, StringLength(200, MinimumLength = 1)] string Password);

public record AuthResponse(string Token, string Username, string FullName, string Role, string Email);

// Packages
public record CreatePackageRequest(
    [Required, StringLength(100, MinimumLength = 1)] string Name,
    [Range(1, 100000)] int SpeedMbps,
    [Range(0.01, 1000000)] decimal MonthlyPrice,
    [StringLength(1000)] string? Description = null);
public record UpdatePackageRequest(
    [Required, StringLength(100, MinimumLength = 1)] string Name,
    [Range(1, 100000)] int SpeedMbps,
    [Range(0.01, 1000000)] decimal MonthlyPrice,
    [StringLength(1000)] string? Description = null,
    bool IsActive = true);

// Areas
public record CreateAreaRequest(Guid CityId, [Required, StringLength(100, MinimumLength = 1)] string Name);
public record UpdateAreaRequest([Required, StringLength(100, MinimumLength = 1)] string Name, bool IsActive);
public record CreateCityRequest([Required, StringLength(100, MinimumLength = 1)] string Name);

// Agent Management
public record CreateAgentRequest(
    [Required, StringLength(50, MinimumLength = 3)] string Username,
    [Required, EmailAddress, StringLength(200)] string Email,
    [Required, StringLength(200, MinimumLength = 1)] string FullName,
    [Required, StringLength(200, MinimumLength = 8)] string Password);
public record UpdateAgentRequest(
    [Required, StringLength(200, MinimumLength = 1)] string FullName,
    [Required, EmailAddress, StringLength(200)] string Email,
    bool IsActive,
    [StringLength(200, MinimumLength = 8)] string? NewPassword = null);

// Chatbot Requests
public record ChatbotOrderRequest(
    [Required, StringLength(200, MinimumLength = 1)] string CustomerName,
    [Required, Phone, StringLength(30)] string CustomerPhone,
    [Required, StringLength(500, MinimumLength = 1)] string CustomerAddress,
    Guid CityId,
    Guid CoverageAreaId,
    Guid PackageId
);
public record ChatbotCallbackRequest(
    [Required, StringLength(200, MinimumLength = 1)] string CustomerName,
    [Required, Phone, StringLength(30)] string CustomerPhone
);
public record ChatbotLeadRequest(
    [Required, StringLength(200, MinimumLength = 1)] string CustomerName,
    [Required, Phone, StringLength(30)] string CustomerPhone,
    [Required, StringLength(100, MinimumLength = 1)] string AreaName,
    [StringLength(100)] string? CityName = null
);

// Order Status Update
public record UpdateOrderStatusRequest(
    OrderStatus Status,
    [StringLength(1000)] string? Notes = null
);

// Admin Dashboard Stats
public record DashboardStatsResponse(
    int TotalOrders,
    int PendingOrders,
    int CompletedConnections,
    int TotalSalesAgents,
    int TotalFutureLeads,
    int TotalCallbacks
);

// Pagination
public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize);

// Callback Status Update
public record UpdateCallbackStatusRequest([Required] string Status, [StringLength(1000)] string? Notes = null);
