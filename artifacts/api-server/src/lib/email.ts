import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? "587");
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (!host || !user || !pass) {
    logger.warn("SMTP credentials not configured — email sending is disabled");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const transport = createTransport();

export function isEmailEnabled(): boolean {
  return transport !== null;
}

export async function sendStreakReminderEmail(params: {
  to: string;
  firstName: string;
}): Promise<boolean> {
  if (!transport) {
    logger.warn({ to: params.to }, "Email skipped — SMTP not configured");
    return false;
  }

  const from = process.env["SMTP_FROM"] ?? process.env["SMTP_USER"] ?? "hello@mindvisi.app";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #0d0a1a; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #1a1030; border-radius: 16px; overflow: hidden; border: 1px solid #2d1f50; }
    .header { background: linear-gradient(135deg, #3d1f7a 0%, #1a0d4a 100%); padding: 40px 40px 32px; text-align: center; }
    .logo { font-size: 28px; font-weight: 700; color: #c4a8f0; letter-spacing: 1px; margin-bottom: 4px; }
    .logo span { color: #f0c060; }
    .tagline { color: #9988cc; font-size: 13px; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 600; color: #e8d8ff; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #b0a0d8; margin-bottom: 20px; }
    .cta-wrapper { text-align: center; margin: 32px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; }
    .quote { background: #120a2a; border-left: 3px solid #7c3aed; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0; font-style: italic; color: #c4b0e8; font-size: 14px; }
    .footer { padding: 24px 40px; border-top: 1px solid #2d1f50; text-align: center; font-size: 12px; color: #6055a0; }
    .footer a { color: #9988cc; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Mind<span>visi</span> ✦</div>
      <div class="tagline">Your daily sanctuary for reflection</div>
    </div>
    <div class="body">
      <div class="greeting">Hey ${params.firstName} 🌙</div>
      <p class="text">
        It's been a quiet day in your reflection space — we noticed you haven't checked in yet. 
        Your thoughts and feelings deserve to be seen and heard.
      </p>
      <div class="quote">
        "The journey of a thousand miles begins with a single step — or in this case, a single thought written down."
      </div>
      <p class="text">
        Take just a moment today. Write whatever is on your mind — a worry, a hope, a frustration, or a dream. 
        Mindvisi will transform it into something beautiful and offer you personalized guidance for your well-being.
      </p>
      <div class="cta-wrapper">
        <a href="https://mindvisi.replit.app/reflect" class="cta">Begin Today's Reflection →</a>
      </div>
      <p class="text" style="font-size: 13px; color: #8878b8; margin-bottom: 0;">
        Your reflection streak keeps your mind in tune. Even one sentence is enough. We're here whenever you're ready. 💜
      </p>
    </div>
    <div class="footer">
      <p>You're receiving this because you have a Mindvisi account.<br/>
      <a href="https://mindvisi.replit.app/privacy">Privacy Policy</a> · To unsubscribe, visit your account settings.</p>
    </div>
  </div>
</body>
</html>
`;

  try {
    await transport.sendMail({
      from: `Mindvisi ✦ <${from}>`,
      to: params.to,
      subject: `${params.firstName}, your reflection space is waiting 🌙`,
      html,
    });
    logger.info({ to: params.to }, "Streak reminder email sent");
    return true;
  } catch (err) {
    logger.error({ err, to: params.to }, "Failed to send streak reminder email");
    return false;
  }
}
