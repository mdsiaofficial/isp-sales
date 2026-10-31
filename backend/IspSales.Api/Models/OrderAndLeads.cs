namespace IspSales.Api.Models;

public enum OrderStatus
{
    PENDING,
    CONFIRMED,
    CONNECTED,
    CANCELLED
}

public class CustomerOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;

    public Guid CityId { get; set; }
    public City? City { get; set; }

    public Guid CoverageAreaId { get; set; }
    public CoverageArea? CoverageArea { get; set; }

    public Guid PackageId { get; set; }
    public InternetPackage? Package { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.PENDING;

    public Guid? AssignedAgentId { get; set; }
    public User? AssignedAgent { get; set; }

    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class CallbackRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Status { get; set; } = "PENDING"; // PENDING, CONTACTED, CLOSED
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FutureLead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CityName { get; set; } = string.Empty;
    public string AreaName { get; set; } = string.Empty;
    public string Status { get; set; } = "NEW"; // NEW, NOTIFIED
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
