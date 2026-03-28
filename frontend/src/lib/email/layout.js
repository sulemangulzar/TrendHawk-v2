/**
 * Master Email Layout for TrendHawk
 * Provides a consistent, premium dark-mode shell for all communications.
 */
export const getEmailLayout = ({ title, contentHtml }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { background-color: #09090b; margin: 0; padding: 0; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #ffffff; }
    .hero { background-color: #111114; border: 1px solid #1f1f23; border-radius: 24px; padding: 48px; max-width: 500px; margin: 40px auto; box-shadow: 0 20px 40px rgba(0,0,0,0.4); text-align: center; }
    .logo-container { width: 56px; height: 56px; background-color: #CCFF00; border-radius: 16px; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center; }
    .logo-img { width: 28px; height: 28px; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.02em; color: #ffffff; }
    p { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #bef264; color: #000000; padding: 16px 32px; border-radius: 12px; font-size: 13px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; box-shadow: 0 4px 20px rgba(190, 242, 100, 0.3); }
    .footer { margin-top: 32px; padding-top: 32px; border-top: 1px solid #1f1f23; text-align: center; }
    .footer-text { font-size: 11px; color: #71717a; line-height: 1.4; }
    .signature { margin-top: 24px; font-size: 11px; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.2em; text-align: center; }
  </style>
</head>
<body>
  <div class="hero">
    <div class="logo-container">
      <svg class="logo-img" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    </div>
    ${contentHtml}
    <div class="footer">
      <p class="footer-text">
        This is a system-generated transmission. If you did not request this access, no action is required.
      </p>
    </div>
  </div>
  <div class="signature">TrendHawk Intelligence Systems · v2.1</div>
</body>
</html>
  `;
};
