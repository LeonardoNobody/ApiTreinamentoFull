using ApiTreinamento.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ApiTreinamento.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // por padrão, tudo exige token
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly ICustomEmailSender _email;
    private readonly FrontendOptions _front;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        ICustomEmailSender email,
        IOptions<FrontendOptions> front,
        IWebHostEnvironment env)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _email = email;
        _front = front.Value;
        _env = env;
    }

    // === DTOs ===
    public record RegisterDto(string Email, string Password);
    public record LoginDto(string Email, string Password, bool RememberMe = false);
    public record ForgotPasswordDto(string Email);
    public record ResetPasswordDto(string UserId, string Token, string NewPassword);
    public record RefreshDto(string RefreshToken);

    // === Register (público) ===
    [AllowAnonymous]
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email e senha são obrigatórios.");

        var user = new IdentityUser { UserName = dto.Email, Email = dto.Email };
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(string.Join("; ", result.Errors.Select(e => e.Description)));

        return Ok("Usuário criado com sucesso.");
    }

    // === Login devolvendo access/refresh (público) ===
    [AllowAnonymous]
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, [FromServices] TokenService tokens)
    {
        var signIn = await _signInManager.PasswordSignInAsync(dto.Email, dto.Password, dto.RememberMe, lockoutOnFailure: true);
        if (!signIn.Succeeded) return Unauthorized("Credenciais inválidas.");

        var user = await _userManager.FindByEmailAsync(dto.Email);
        var fp = Request.Headers.UserAgent.ToString(); // “fingerprint” simples

        var pair = await tokens.IssueAsync(user!, fingerprint: fp);

        return Ok(new
        {
            accessToken = pair.AccessToken,
            accessExpiresAt = pair.AccessExpiresUtc,
            refreshToken = pair.RefreshToken,
            refreshExpiresAt = pair.RefreshExpiresUtc
        });
    }

    // === “Quem sou eu?” (protegidão) ===
    [HttpGet("me")]
    public IActionResult Me()
    {
        string? sub =
            User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirst("sub")?.Value;

        string? email =
            User.FindFirstValue(JwtRegisteredClaimNames.Email) ??
            User.FindFirstValue(ClaimTypes.Email) ??
            User.FindFirst("email")?.Value;

        string? jti =
            User.FindFirstValue(JwtRegisteredClaimNames.Jti) ??
            User.FindFirst("jti")?.Value;

        return Ok(new { sub, email, jti });
    }

    [HttpGet("claims-debug")]
    public IActionResult ClaimsDebug()
    {
        var list = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        return Ok(list);
    }


    // === Forgot password (público) ===
    [AllowAnonymous]
    [HttpPost("forgot-password")]
    [EnableRateLimiting("password-flows")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        const string generic = "Se o e-mail existir, enviaremos instruções para redefinição.";
        if (string.IsNullOrWhiteSpace(dto.Email)) return Ok(generic);

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null) { await Task.Delay(400); return Ok(generic); }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var tokenEncoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var baseUrl = _front.ResetUrlBase;
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            var req = HttpContext.Request;
            baseUrl = $"{req.Scheme}://{req.Host}/reset-password";
        }

        var callbackUrl =
            $"{baseUrl}?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(tokenEncoded)}";

        var html = $@"
  <p>Olá,</p>
  <p>Recebemos uma solicitação para redefinir sua senha no <strong>OptikTrack</strong>.</p>

  <p><a href=""{callbackUrl}""
        style=""background:#0d6efd;color:#fff;padding:10px 14px;border-radius:8px;
               text-decoration:none;display:inline-block"">Redefinir Senha</a></p>

  <p style=""margin-top:16px;color:#444"">Se preferir, você pode usar o <strong>token</strong> abaixo manualmente:</p>
  <div style=""font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
              white-space:normal;word-break:break-all;background:#f6f8fa;border:1px solid #eaecef;
              border-radius:8px;padding:12px;font-size:13px"">
    <div style=""color:#666;margin-bottom:6px"">Token de redefinição</div>
    <div>{tokenEncoded}</div>
  </div>

  <p style=""font-size:12px;color:#666;margin-top:10px"">
    (Dica: o token já virá preenchido automaticamente quando você abrir o link.)
  </p>

  <p>Se você não solicitou, ignore este e-mail.</p>";

        await _email.SendAsync(dto.Email, "Redefinição de senha - OptikTrack", html);

        if (_env.IsDevelopment()) return Ok(new { message = generic, callbackUrl });
        return Ok(generic);
    }

    // === Reset password (público) ===
    [AllowAnonymous]
    [HttpPost("reset-password")]
    [EnableRateLimiting("password-flows")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserId) ||
            string.IsNullOrWhiteSpace(dto.Token) ||
            string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest("Dados inválidos.");

        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null) return BadRequest("Solicitação inválida.");

        string tokenDecoded;
        try
        {
            var tokenBytes = WebEncoders.Base64UrlDecode(dto.Token);
            tokenDecoded = Encoding.UTF8.GetString(tokenBytes);
        }
        catch
        {
            return BadRequest("Token inválido.");
        }

        var result = await _userManager.ResetPasswordAsync(user, tokenDecoded, dto.NewPassword);
        if (!result.Succeeded)
            return BadRequest(string.Join("; ", result.Errors.Select(e => e.Description)));

        return Ok("Senha redefinida com sucesso.");
    }

    [AllowAnonymous]
    [HttpGet("reset-email")]
    public async Task<IActionResult> GetResetEmail([FromQuery] string userId, [FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            return BadRequest("Parâmetros ausentes.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        string tokenDecoded;
        try
        {
            var tokenBytes = WebEncoders.Base64UrlDecode(token);
            tokenDecoded = Encoding.UTF8.GetString(tokenBytes);
        }
        catch
        {
            return BadRequest("Token inválido.");
        }

        // valida sem trocar senha
        var valid = await _userManager.VerifyUserTokenAsync(
            user,
            _userManager.Options.Tokens.PasswordResetTokenProvider,
            "ResetPassword",
            tokenDecoded);

        if (!valid) return BadRequest("Token inválido ou expirado.");

        static string Mask(string email)
        {
            var at = email.IndexOf('@');
            if (at <= 1) return "***";
            var name = email[..at];
            var dom = email[(at + 1)..];
            var head = name[..Math.Min(2, name.Length)];
            return $"{head}{new string('*', Math.Max(1, name.Length - 2))}@{dom}";
        }

        return Ok(new { email = Mask(user.Email) });
    }




    // === Refresh (rotação segura) — público porque usa refresh em body ===
    [AllowAnonymous]
    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh([FromBody] RefreshDto dto, [FromServices] TokenService tokens)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return BadRequest("Refresh token obrigatório.");

        var fp = Request.Headers.UserAgent.ToString();
        var pair = await tokens.RotateAsync(dto.RefreshToken, fingerprint: fp);

        return pair is null
            ? Unauthorized("Refresh inválido ou expirado.")
            : Ok(new
            {
                accessToken = pair.AccessToken,
                accessExpiresAt = pair.AccessExpiresUtc,
                refreshToken = pair.RefreshToken,
                refreshExpiresAt = pair.RefreshExpiresUtc
            });
    }

    // === Logout (revoga refresh atual) ===
    [HttpPost("logout")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Logout([FromBody] RefreshDto dto, [FromServices] TokenService tokens)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return BadRequest("Refresh token obrigatório.");

        await tokens.RevokeRefreshAsync(dto.RefreshToken);
        return NoContent();
    }
}
