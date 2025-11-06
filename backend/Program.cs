using ApiTreinamento.Data;
using ApiTreinamento.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

SQLitePCL.Batteries_V2.Init();

var builder = WebApplication.CreateBuilder(args);

// =========================
// 1) CONFIGURAÇÕES (JWT, DB, Identity, CORS, etc.)
// =========================

// JWT (garantias)
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key ausente ou fraca (>= 32 chars).");

// EF Core (SQLite)
builder.Services.AddDbContext<ApplicationDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services
    .AddIdentity<IdentityUser, IdentityRole>(opt =>
    {
        opt.Password.RequireDigit = true;
        opt.Password.RequiredLength = 8;
        opt.Password.RequireUppercase = false;
        opt.Password.RequireNonAlphanumeric = false;
        opt.Lockout.AllowedForNewUsers = true;
        opt.Lockout.MaxFailedAccessAttempts = 5;
        // opt.SignIn.RequireConfirmedEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Auth (JWT)
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = false;
        o.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        o.SaveToken = true;
        o.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        // exemplo de revogação por jti (se você já tem a tabela)
        o.Events = new JwtBearerEvents
        {
            OnTokenValidated = async ctx =>
            {
                var db = ctx.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                var jti = ctx.Principal?.FindFirst("jti")?.Value;
                if (!string.IsNullOrEmpty(jti))
                {
                    var revoked = await db.RevokedJwts
                        .AnyAsync(x => x.Jti == jti && x.ExpiresAtUtc > DateTime.UtcNow);
                    if (revoked) ctx.Fail("Token revogado.");
                }
            }
        };
    });

// CORS — **NOMEIE E USE ESSA POLICY**
builder.Services.AddCors(o =>
{
    o.AddPolicy("FrontDev", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// Rate limiting
builder.Services.AddRateLimiter(o =>
{
    o.AddFixedWindowLimiter("password-flows", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(5);
    });
    o.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 20;
        opt.Window = TimeSpan.FromMinutes(1);
    });
});

// SMTP / Frontend options / serviços seus
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.Configure<FrontendOptions>(builder.Configuration.GetSection("Frontend"));
builder.Services.AddScoped<ICustomEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<TokenService>();

builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("OnlyAdmins", p => p.RequireRole("Admin"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Digite: Bearer {seu_token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { new OpenApiSecurityScheme{ Reference=new OpenApiReference{
            Type=ReferenceType.SecurityScheme, Id="Bearer"}}, Array.Empty<string>() }
    });
});

// =========================
// 2) BUILD DO APP
// =========================
var app = builder.Build();

// Swagger (dev)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// **AQUI**: CORS primeiro, antes dos endpoints
app.UseCors("FrontDev");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

// Endpoint público simples p/ teste de comunicação
app.MapGet("/api/health", () =>
    Results.Ok(new { status = "ok", time = DateTime.UtcNow }))
   .AllowAnonymous();

// Página simples de reset (a sua)
app.MapGet("/reset-password", () =>
{
    const string html = """
<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Redefinir senha • OptikTrack</title>
<style>
  :root{--bg:#fff;--b:#eaecef;--txt:#111;--mut:#666;--ok:#0f7b0f;--err:#b00020;--pri:#0d6efd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;background:#f6f8fa;
       color:var(--txt);max-width:520px;margin:40px auto;padding:0 16px}
  .card{background:var(--bg);border:1px solid var(--b);border-radius:14px;padding:24px;
        box-shadow:0 6px 16px rgba(0,0,0,.06)}
  h1{font-size:20px;margin:0 0 10px}
  p.help{color:var(--mut);margin-top:0}
  label{font-size:14px;color:#444}
  input{width:100%;padding:10px 12px;border:1px solid var(--b);border-radius:10px;margin-top:6px}
  button{margin-top:14px;padding:10px 14px;border:0;border-radius:10px;background:var(--pri);
         color:#fff;cursor:pointer}
  .msg{margin-top:12px;font-size:14px}.ok{color:var(--ok)}.err{color:var(--err)}
</style></head><body>
  <div class="card">
    <h1>Redefinir senha</h1>
    <p class="help">Defina sua nova senha. O token já vem preenchido automaticamente.</p>

    <label for="token">Token</label>
    <input id="token" type="text" placeholder="Token" />

    <label for="pwd" style="margin-top:10px">Nova senha</label>
    <input id="pwd" type="password" placeholder="Nova senha" />

    <button id="btn">Redefinir</button>
    <div id="msg" class="msg"></div>
  </div>

<script>
(function(){
  const qs = new URLSearchParams(location.search);
  const userId = qs.get("userId");
  const tokenQ = qs.get("token");

  const $token = document.getElementById("token");
  const $pwd   = document.getElementById("pwd");
  const $btn   = document.getElementById("btn");
  const $msg   = document.getElementById("msg");

  if(tokenQ){ $token.value = tokenQ; }

  function error(m){ $msg.className="msg err"; $msg.textContent=m; }
  function ok(m){ $msg.className="msg ok"; $msg.textContent=m; }

  $btn.addEventListener("click", async () => {
    const newPassword = $pwd.value.trim();
    const token = $token.value.trim();

    if(!userId || !tokenQ){ return error("Link inválido. Solicite novamente."); }
    if(!token){ return error("Informe o token."); }
    if(!newPassword){ return error("Informe a nova senha."); }

    $btn.disabled = true; $msg.textContent = "Enviando…";

    try{
      const res = await fetch("/api/auth/reset-password", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ userId, token, newPassword })
      });
      const text = await res.text();
      if(res.ok) ok(text || "Senha redefinida com sucesso!");
      else error(text || "Não foi possível redefinir a senha (token inválido?).");
    } catch(e){
      error("Erro de rede ao enviar solicitação.");
    } finally{
      $btn.disabled = false;
    }
  });
})();
</script>
</body></html>
""";
    return Results.Content(html, "text/html; charset=utf-8");
}).AllowAnonymous();

// Auto-migrate (apenas 1x)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

app.Run();
