using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;


namespace ApiTreinamento.Services



{
    public class SmtpOptions
    {
        public string Host { get; set; } = "";
        public int Port { get; set; } = 587;
        public bool UseStartTls { get; set; } = true;
        public string UserName { get; set; } = "";
        public string Password { get; set; } = "";
        public string FromEmail { get; set; } = "";
        public string FromName { get; set; } = "OptikTrack";
    }
    public class FrontendOptions
    {
        public string ResetUrlBase { get; set; } = "";
    }

    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
    }

    public interface ICustomEmailSender
    {
        Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
    }

    public class SmtpEmailSender : ICustomEmailSender
    {
        private readonly SmtpOptions _opts;
        public SmtpEmailSender(IOptions<SmtpOptions> opts) => _opts = opts.Value;

        public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress(_opts.FromName, _opts.FromEmail));
            msg.To.Add(MailboxAddress.Parse(toEmail));
            msg.Subject = subject;

            var body = new BodyBuilder { HtmlBody = htmlBody };
            msg.Body = body.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_opts.Host, _opts.Port, SecureSocketOptions.StartTlsWhenAvailable, ct);
            await client.AuthenticateAsync(_opts.UserName, _opts.Password, ct);
            await client.SendAsync(msg, ct);
            await client.DisconnectAsync(true, ct);
        }
    }


}

