using IspSales.Api.Models;

namespace IspSales.Api.DTOs;

// Auth
public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, string Username, string FullName, string Role, string Email);

// Packages
public record CreatePackageRequest(string Name, int SpeedMbps, decimal MonthlyPrice, string Description);
public record UpdatePackageRequest(string Name, int SpeedMbps, decimal MonthlyPrice, string Description, bool IsActive);

// Areas
public record CreateAreaRequest(Guid CityId, string Name);
public record UpdateAreaRequest(string Name, bool IsActive);
public record CreateCityRequest(string Name);

// Agent Management
public record CreateAgentRequest(string Username, string Email, string FullName, string Password);
public record UpdateAgentRequest(string FullName, string Email, bool IsActive, string? NewPassword);

// Chatbot Requests
public record ChatbotOrderRequest(
    string CustomerName,
    string CustomerPhone,
    string CustomerAddress,
    Guid CityId,
    Guid CoverageAreaId,
    Guid PackageId
);

public record ChatbotCallbackRequest(
    string CustomerName,
    string CustomerPhone
);

public record ChatbotLeadRequest(
    string CustomerName,
    string CustomerPhone,
    string CityName,
    string AreaName
);

// Order Status Update
public record UpdateOrderStatusRequest(
    OrderStatus Status,
    string? Notes
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
