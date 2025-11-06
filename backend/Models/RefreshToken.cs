namespace ApiTreinamento.Models
{
    
    public class RefreshToken
    {
        public int Id { get; set; }

        public string UserId { get; set; } = default!;
        public string TokenHash { get; set; } = default!;
        public DateTime ExpiresAtUtc { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? RevokedAtUtc { get; set; }

        public string? Fingerprint { get; set; }          // opcional (User-Agent)
        public string? ReplacedByTokenHash { get; set; }  // para trilhar rotações
    }

    // Opcional: tabela de jtis revogados
    public class RevokedJwt
    {
        public int Id { get; set; }
        public string Jti { get; set; } = default!;
        public DateTime RevokedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAtUtc { get; set; }            // = exp do access token
    }



}