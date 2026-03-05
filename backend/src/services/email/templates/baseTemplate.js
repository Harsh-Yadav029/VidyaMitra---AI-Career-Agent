const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0f1e; color: #e2e8f0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
    .header h1 { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 6px; }
    .body { background: #111827; border: 1px solid #1e293b; border-top: none; padding: 32px; border-radius: 0 0 16px 16px; }
    .greeting { font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 16px; }
    .text { font-size: 15px; color: #94a3b8; line-height: 1.7; margin-bottom: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .card-title { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .stat { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #334155; }
    .stat:last-child { border-bottom: none; }
    .stat-label { font-size: 14px; color: #94a3b8; }
    .stat-value { font-size: 16px; font-weight: 700; color: #22d3ee; }
    .score-big { text-align: center; padding: 20px; }
    .score-number { font-size: 64px; font-weight: 900; color: #22d3ee; line-height: 1; }
    .score-label { font-size: 14px; color: #64748b; margin-top: 4px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .tag { display: inline-block; background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.2); color: #22d3ee; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-family: monospace; margin: 3px; }
    .footer { text-align: center; padding: 24px; color: #475569; font-size: 12px; }
    .footer a { color: #22d3ee; text-decoration: none; }
    .divider { height: 1px; background: #1e293b; margin: 20px 0; }
    .highlight { color: #22d3ee; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎓 VidyaMitra</h1>
      <p>Your AI-Powered Career Companion</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 VidyaMitra · <a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a></p>
      <p style="margin-top:8px">This email was sent because you have an account at VidyaMitra.</p>
    </div>
  </div>
</body>
</html>`;

module.exports = baseTemplate;