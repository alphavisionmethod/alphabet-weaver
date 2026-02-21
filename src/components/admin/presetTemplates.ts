export const PRESET_TEMPLATES = [
  {
    name: "SITA Welcome — Boardroom",
    subject: "The Boardroom is Now Open, {{firstName}}",
    category: "welcome",
    tier_specific: null,
    is_active: true,
    html_content: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 0; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #333; }
  .header { padding: 40px; text-align: center; background: linear-gradient(135deg, #4b2c82 0%, #1a1a1a 100%); }
  .logo { width: 80px; margin-bottom: 20px; }
  .content { padding: 40px; line-height: 1.6; }
  .gold-text { color: #FFB84D; font-weight: bold; }
  .button { display: inline-block; padding: 15px 30px; background: linear-gradient(to right, #6A3093, #a044ff); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 25px; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="{{siteUrl}}/sita-logo.jpeg" alt="SITA Logo" class="logo">
      <h1 style="margin:0; font-size: 28px;">Your Seat is Ready.</h1>
    </div>
    <div class="content">
      <p>Hello {{firstName}},</p>
      <p>Welcome to the inner circle. You've just unlocked access to a <span class="gold-text">Board of Advisors</span> designed with one singular purpose: to increase your revenue.</p>
      <p>Whether you're navigating complex business pivots or fine-tuning your personal finances, you no longer have to make those calls alone. Billionaire-level advisory is now in the palm of your hand.</p>
      <a href="{{siteUrl}}" class="button">Enter the Boardroom</a>
    </div>
    <div class="footer">
      &copy; {{year}} SITA Advisory. All rights reserved.<br>
      You are receiving this because you opted into elite financial advisory.
    </div>
  </div>
</body>
</html>`,
  },
  {
    name: "SITA Backer Thank You",
    subject: "A Partnership Built for Growth",
    category: "welcome",
    tier_specific: null,
    is_active: true,
    html_content: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #121212; color: #ffffff; margin: 0; padding: 0; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 2px solid #FFB84D; }
  .content { padding: 40px; text-align: center; line-height: 1.6; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <h2 style="color: #FFB84D;">Thank You for the Trust, {{firstName}}.</h2>
      <p>Success isn't a solo sport. By backing SITA, you aren't just a user—you are a partner in a vision to democratize elite-level financial intelligence.</p>
      <p style="font-style: italic; color: #cccccc;">"We are committed to scaling your legacy as aggressively as we scale our own."</p>
      <div style="margin: 30px 0; height: 1px; background: #333;"></div>
      <p>Your support allows us to continue refining the algorithms and expertise that drive your revenue upward.</p>
      <p><strong>Welcome to the future of wealth.</strong></p>
    </div>
    <div class="footer">
      &copy; {{year}} SITA Advisory. All rights reserved.<br>
      <a href="{{unsubscribeUrl}}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`,
  },
];
