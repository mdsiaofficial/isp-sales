using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IspSales.Api.Data;
using IspSales.Api.DTOs;
using IspSales.Api.Services;

namespace IspSales.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request == null)
            return BadRequest(new { message = "Request body is required." });

        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Username.ToLower() == request.Username.ToLower() ||
            u.Email.ToLower() == request.Username.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        if (!user.IsActive)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "This account has been deactivated." });
        }

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Username, user.FullName, user.Role.ToString(), user.Email));
    }
}
