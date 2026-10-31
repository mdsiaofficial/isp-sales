using Microsoft.EntityFrameworkCore;
using IspSales.Api.Models;

namespace IspSales.Api.Data;

public static class DbSeeder
{
    private static readonly string[] FirstNames =
    {
        "Tanvir", "Rahim", "Karim", "Sadia", "Nusrat", "Imran", "Fahim", "Mitu", "Rafi", "Sabbir",
        "Ayesha", "Jannat", "Hasan", "Tariq", "Mehedi", "Sadia", "Ruma", "Shakil", "Nabila", "Arif"
    };

    private static readonly string[] LastNames =
    {
        "Ahmed", "Hossain", "Khan", "Islam", "Rahman", "Uddin", "Ali", "Chowdhury", "Sarkar", "Begum"
    };

    private static readonly string[] Addresses =
    {
        "House 12, Road 4, Uttara Sector 7",
        "Flat 3B, Green Road, Dhanmondi",
        "Holding 45, Mirpur DOHS",
        "Villa 8, Bashundhara R/A",
        "Apartment 5A, Agrabad C/A",
        "House 22, Colonelhat Residential",
        "Plot 9, Savar Bazar Road",
        "Flat 2C, Ashulia Model Town",
        "House 7, Mohammadpur Housing",
        "Apartment 10D, Boropol Main Road"
    };

    private static readonly string[] Packages =
    {
        "Basic Home", "Standard Fiber", "Turbo Ultra", "Gigabit Pro"
    };

    private static readonly int[] Speeds = { 20, 50, 100, 200 };
    private static readonly decimal[] Prices = { 500m, 800m, 1200m, 2000m };

    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Cities and Coverage Areas
        if (!await context.Cities.AnyAsync())
        {
            var dhaka = new City
            {
                Name = "Dhaka",
                CoverageAreas = new List<CoverageArea>
                {
                    new() { Name = "Uttara" },
                    new() { Name = "Ashulia" },
                    new() { Name = "Savar" },
                    new() { Name = "Mohammadpur" }
                }
            };

            var chattogram = new City
            {
                Name = "Chattogram",
                CoverageAreas = new List<CoverageArea>
                {
                    new() { Name = "Colonelhat" },
                    new() { Name = "Agrabad" },
                    new() { Name = "Boropol" }
                }
            };

            context.Cities.AddRange(dhaka, chattogram);
            await context.SaveChangesAsync();
        }

        // 2. Seed Default Packages
        if (!await context.InternetPackages.AnyAsync())
        {
            var packages = new List<InternetPackage>
            {
                new() { Name = "Basic Home", SpeedMbps = 20, MonthlyPrice = 500, Description = "Ideal for everyday browsing, social media, and SD streaming.", IsActive = true },
                new() { Name = "Standard Fiber", SpeedMbps = 50, MonthlyPrice = 800, Description = "Fast, buffer-free HD streaming, online meetings, and gaming.", IsActive = true },
                new() { Name = "Turbo Ultra", SpeedMbps = 100, MonthlyPrice = 1200, Description = "High capacity bandwidth for multi-device homes and 4K streaming.", IsActive = true },
                new() { Name = "Gigabit Pro", SpeedMbps = 200, MonthlyPrice = 2000, Description = "Ultra-low latency fiber internet for tech professionals and streamers.", IsActive = true }
            };

            context.InternetPackages.AddRange(packages);
            await context.SaveChangesAsync();
        }

        // 3. Seed Users (Admin & Initial Agents)
        if (!await context.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@ispsales.local",
                FullName = "System Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                IsActive = true
            };

            var agentUser = new User
            {
                Username = "agent",
                Email = "agent@ispsales.local",
                FullName = "Sales Agent Rahman",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Agent@123"),
                Role = UserRole.SalesAgent,
                IsActive = true
            };

            context.Users.AddRange(adminUser, agentUser);
            await context.SaveChangesAsync();
        }

        // Seed additional sales agents up to 10 total
        var agentCount = await context.Users.CountAsync(u => u.Role == UserRole.SalesAgent);
        if (agentCount < 10)
        {
            for (int i = agentCount + 1; i <= 10; i++)
            {
                context.Users.Add(new User
                {
                    Username = $"agent{i}",
                    Email = $"agent{i}@ispsales.local",
                    FullName = $"Sales Agent {i}",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Agent@123"),
                    Role = UserRole.SalesAgent,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            await context.SaveChangesAsync();
        }

        // 4. Seed Customer Orders (minimum 50)
        var orderCount = await context.CustomerOrders.CountAsync();
        if (orderCount < 50)
        {
            var cities = await context.Cities.Include(c => c.CoverageAreas).ToListAsync();
            var packages = await context.InternetPackages.Where(p => p.IsActive).ToListAsync();
            var agents = await context.Users.Where(u => u.Role == UserRole.SalesAgent).ToListAsync();
            var rng = new Random(42);

            for (int i = orderCount; i < 50; i++)
            {
                var city = cities[rng.Next(cities.Count)];
                var area = city.CoverageAreas[rng.Next(city.CoverageAreas.Count)];
                var pkg = packages[rng.Next(packages.Count)];
                var agent = agents[rng.Next(agents.Count)];
                var status = (OrderStatus)rng.Next(0, 4);

                var order = new CustomerOrder
                {
                    OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                    CustomerName = $"{FirstNames[rng.Next(FirstNames.Length)]} {LastNames[rng.Next(LastNames.Length)]}",
                    CustomerPhone = $"01{rng.Next(3, 10)}{rng.Next(10000000, 99999999)}",
                    CustomerAddress = Addresses[rng.Next(Addresses.Length)],
                    CityId = city.Id,
                    CoverageAreaId = area.Id,
                    PackageId = pkg.Id,
                    Status = status,
                    AssignedAgentId = agent.Id,
                    Notes = status == OrderStatus.CONNECTED ? "Installation completed successfully." : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-rng.Next(0, 60)),
                    UpdatedAt = status != OrderStatus.PENDING ? DateTime.UtcNow.AddDays(-rng.Next(0, 30)) : null
                };

                context.CustomerOrders.Add(order);
            }
            await context.SaveChangesAsync();
        }

        // 5. Seed Future Leads (minimum 50)
        var leadCount = await context.FutureLeads.CountAsync();
        if (leadCount < 50)
        {
            var rng = new Random(7);
            var cityNames = new[] { "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh" };
            var areaNames = new[] { "Mirpur", "Gulshan", "Dhanmondi", "Uttara Extension", "Keraniganj", "Narayanganj", "Comilla", "Cox's Bazar", "Bogura", "Jessore" };

            for (int i = leadCount; i < 50; i++)
            {
                context.FutureLeads.Add(new FutureLead
                {
                    CustomerName = $"{FirstNames[rng.Next(FirstNames.Length)]} {LastNames[rng.Next(LastNames.Length)]}",
                    CustomerPhone = $"01{rng.Next(3, 10)}{rng.Next(10000000, 99999999)}",
                    CityName = cityNames[rng.Next(cityNames.Length)],
                    AreaName = areaNames[rng.Next(areaNames.Length)],
                    Status = rng.Next(0, 2) == 0 ? "NEW" : "NOTIFIED",
                    CreatedAt = DateTime.UtcNow.AddDays(-rng.Next(0, 90))
                });
            }
            await context.SaveChangesAsync();
        }

        // 6. Seed Callback Requests (minimum 50)
        var callbackCount = await context.CallbackRequests.CountAsync();
        if (callbackCount < 50)
        {
            var rng = new Random(99);
            var statuses = new[] { "PENDING", "CONTACTED", "CLOSED" };

            for (int i = callbackCount; i < 50; i++)
            {
                context.CallbackRequests.Add(new CallbackRequest
                {
                    CustomerName = $"{FirstNames[rng.Next(FirstNames.Length)]} {LastNames[rng.Next(LastNames.Length)]}",
                    CustomerPhone = $"01{rng.Next(3, 10)}{rng.Next(10000000, 99999999)}",
                    Status = statuses[rng.Next(statuses.Length)],
                    Notes = rng.Next(0, 2) == 0 ? "Requested callback during business hours." : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-rng.Next(0, 45))
                });
            }
            await context.SaveChangesAsync();
        }
    }
}
