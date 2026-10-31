namespace IspSales.Api.Models;

public class City
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public List<CoverageArea> CoverageAreas { get; set; } = new();
}

public class CoverageArea
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CityId { get; set; }
    public City? City { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
