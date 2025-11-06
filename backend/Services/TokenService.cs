using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ApiTreinamento.Data;
using ApiTreinamento.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ApiTreinamento.Services;

public record TokenPair(
    string AccessToken, DateTime AccessExpiresUtc,
    string RefreshToken, DateTime RefreshExpiresUtc);

public class TokenService
{
    private readonly IConfiguration _cfg;
    private readonly UserManager<IdentityUser> _users;
    private readonly ApplicationDbContext _db;

    public TokenService(IConfiguration cfg, UserManager<IdentityUser> users, ApplicationDbContext db)
    {
        _cfg = cfg;
        _users = users;
        _db = db;
    }

    // ======== Público: emite par (login) ========
    public async Task<TokenPair> IssueAsync(IdentityUser user, string? fingerprint = null)
    {
        var (access, accessExp) = await IssueAccessAsync(user, fingerprint);
        var (refresh, refreshExp) = await IssueRefreshAsync(user, fingerprint);

        return new TokenPair(access, accessExp, refresh, refreshExp);
    }

    // ======== Público: rotaciona refresh ========
    public async Task<TokenPair?> RotateAsync(string refreshToken, string? fingerprint = null)
    {
        var hash = Hash(refreshToken);
        var now = DateTime.UtcNow;

        var current = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == hash);

        if (current is null) return null;                 // não existe
        if (current.RevokedAtUtc is not null) return null; // já revogado
        if (current.ExpiresAtUtc <= now) return null;      // expirado

        // Opcional: validar fingerprint se quiser amarrar device
        // if (!string.Equals(current.Fingerprint, fingerprint, StringComparison.Ordinal)) return null;

        var user = await _users.FindByIdAsync(current.UserId);
        if (user is null) return null;

        // marca como revogado e registra o hash do substituto
        current.RevokedAtUtc = now;

        var (newRefresh, newRefreshExp) = await IssueRefreshAsync(user, fingerprint);
        current.ReplacedByTokenHash = Hash(newRefresh);

        // novo access
        var (access, accessExp) = await IssueAccessAsync(user, fingerprint);

        await _db.SaveChangesAsync();

        return new TokenPair(access, accessExp, newRefresh, newRefreshExp);
    }

    // ======== Público: revoga um refresh ========
    public async Task RevokeRefreshAsync(string refreshToken)
    {
        var hash = Hash(refreshToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash);
        if (token is null) return;

        token.RevokedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    // ------------------- helpers -------------------

    private async Task<(string AccessToken, DateTime ExpiresUtc)> IssueAccessAsync(IdentityUser user, string? fingerprint)
    {
        var issuer = _cfg["Jwt:Issuer"];
        var audience = _cfg["Jwt:Audience"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var jti = Guid.NewGuid().ToString("N");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,   user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti,   jti),

            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email,          user.Email ?? string.Empty)
        };

        // roles
        var roles = await _users.GetRolesAsync(user);
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        if (!string.IsNullOrWhiteSpace(fingerprint))
            claims.Add(new Claim("fp", fingerprint));

        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(15); // ajuste se quiser

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: creds);

        var token = new JwtSecurityTokenHandler().WriteToken(jwt);
        return (token, expires);
    }

    private async Task<(string Refresh, DateTime ExpiresUtc)> IssueRefreshAsync(IdentityUser user, string? fingerprint)
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        var refresh = Base64UrlEncode(bytes); // string segura pra URL
        var hash = Hash(refresh);

        var expires = DateTime.UtcNow.AddDays(7); // ajuste se quiser

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAtUtc = expires,
            Fingerprint = fingerprint
        });

        await _db.SaveChangesAsync();
        return (refresh, expires);
    }

    private static string Hash(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes); // readable hash
    }

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}
