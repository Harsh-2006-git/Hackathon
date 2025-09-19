import nodemailer from "nodemailer";
import crypto from "crypto";

// Using your Hostinger SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4,
});

/**
 * Generate 6-digit OTP
 * @returns {string} - 6-digit OTP code
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send OTP email for email verification
 * @param {string} email - Client's email address
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTPEmail = async (email, otp) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Ujjain Yatra</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        .email-container{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.6;color:#334155;background:linear-gradient(135deg,#ff6b35 0%,#f7931e 50%,#ff8c42 100%);min-height:100vh;padding:20px}
        .email-wrapper{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,.25)}
        .header{background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);padding:40px 30px;text-align:center;position:relative;overflow:hidden}
        .header::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.1) 0%,transparent 70%);animation:pulse 4s ease-in-out infinite}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.1);opacity:.8}}
        .logo{width:100px;height:100px;margin:0 auto 20px;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.3);position:relative;z-index:1;overflow:hidden}
        .logo img{width:90%;height:90%;object-fit:cover;border-radius:50%}
        .company-name{color:#fff;font-size:28px;font-weight:700;margin-bottom:8px;position:relative;z-index:1}
        .tagline{color:rgba(255,255,255,.9);font-size:14px;font-weight:400;position:relative;z-index:1}
        .content{padding:40px 30px}
        .welcome-section{text-align:center;margin-bottom:40px}
        .welcome-icon{width:64px;height:64px;margin:0 auto 24px;background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px}
        .welcome-title{font-size:24px;font-weight:600;color:#111827;margin-bottom:12px}
        .welcome-text{color:#6b7280;font-size:16px;max-width:400px;margin:0 auto}
        .otp-section{background:linear-gradient(135deg,#fff4e6 0%,#fef3c7 100%);border:2px solid #f59e0b;border-radius:16px;padding:32px;text-align:center;margin:32px 0;position:relative;overflow:hidden}
        .otp-section::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ff6b35,#f7931e,#ff8c42)}
        .otp-label{color:#92400e;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px}
        .otp-code{font-size:42px;font-weight:700;color:#111827;font-family:'Courier New',monospace;letter-spacing:6px;background:#fff;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.05);margin:16px 0;border:1px solid #f59e0b}
        .otp-helper{color:#92400e;font-size:12px;margin-top:12px}
        .warning-box{background:#fef3cd;border:1px solid #f59e0b;border-radius:12px;padding:20px;margin:24px 0;display:flex;align-items:flex-start;gap:12px}
        .warning-icon{color:#d97706;font-size:20px;margin-top:2px}
        .warning-content h4{color:#92400e;font-size:14px;font-weight:600;margin-bottom:4px}
        .warning-content p{color:#92400e;font-size:14px;margin:0}
        .cta-section{text-align:center;margin:32px 0}
        .cta-button{display:inline-block;background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);color:#fff;text-decoration:none;padding:16px 32px;border-radius:50px;font-weight:600;font-size:16px;box-shadow:0 10px 25px rgba(255,107,53,.3);transition:all .3s ease;border:none}
        .cta-button:hover{transform:translateY(-2px);box-shadow:0 15px 35px rgba(255,107,53,.4)}
        .help-text{color:#9ca3af;font-size:12px;margin-top:16px}
        .security-notice{background:#f0fdf4;border:1px solid #22c55e;border-radius:12px;padding:20px;margin:24px 0;display:flex;align-items:flex-start;gap:12px}
        .security-icon{color:#16a34a;font-size:20px;margin-top:2px}
        .security-content h4{color:#15803d;font-size:14px;font-weight:600;margin-bottom:4px}
        .security-content p{color:#15803d;font-size:14px;margin:0}
        .footer{background:#2d1810;color:#fff;padding:32px 30px}
        .footer-content{text-align:center}
        .footer-title{font-size:18px;font-weight:600;margin-bottom:12px}
        .footer-subtitle{color:#9ca3af;font-size:14px;margin-bottom:20px}
        .footer-links{display:flex;justify-content:center;gap:15px;margin-bottom:24px;flex-wrap:wrap}
        .footer-link{color:#ff8c42;text-decoration:none;font-size:14px;transition:color .3s ease}
        .footer-link:hover{color:#ffab70}
        .footer-divider{height:1px;background:#4a2c1d;margin:24px 0}
        .footer-bottom{text-align:center}
        .footer-bottom p{color:#9ca3af;font-size:12px;margin-bottom:8px}
        .footer-bottom a{color:#ff8c42;text-decoration:none}
        @media (max-width:600px){
            .email-container{padding:10px}
            .header{padding:30px 20px}
            .content{padding:30px 20px}
            .otp-code{font-size:32px;letter-spacing:4px}
            .footer-links{flex-direction:column;gap:12px}
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-wrapper">
            <div class="header">
                <div class="logo">
                    <img src="https://img.freepik.com/premium-vector/sadhu-sitting-meditating-isolated_1076263-601.jpg?w=740" alt="Ujjain Yatra Logo">
                </div>
                <h1 class="company-name">Ujjain Yatra</h1>
                <p class="tagline">Sacred • Spiritual • Meaningful</p>
            </div>
            <div class="content">
                <div class="welcome-section">
                    <div class="welcome-icon">🕉️</div>
                    <h2 class="welcome-title">Email Verification Required</h2>
                    <p class="welcome-text">Welcome to Ujjain Yatra! Please verify your email address using the verification code below to complete your account setup and begin your spiritual journey.</p>
                </div>
                <div class="otp-section">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="otp-helper">Enter this code in the verification form</div>
                </div>
                <div class="warning-box">
                    <div class="warning-icon">⏰</div>
                    <div class="warning-content">
                        <h4>Time Sensitive</h4>
                        <p>This verification code expires in <strong>10 minutes</strong>. If expired, please request a new code from the application.</p>
                    </div>
                </div>
                <div class="cta-section">
                    <a href="#" class="cta-button">Complete Verification →</a>
                    <div class="help-text">Having trouble? Contact our support team for assistance</div>
                </div>
                <div class="security-notice">
                    <div class="security-icon">🛡️</div>
                    <div class="security-content">
                        <h4>Security Notice</h4>
                        <p>If you didn't create an account with Ujjain Yatra, please ignore this email. No account has been created and no further action is required.</p>
                    </div>
                </div>
            </div>
            <div class="footer">
                <div class="footer-content">
                    <h3 class="footer-title">Need Assistance?</h3>
                    <p class="footer-subtitle">Our support team is ready to help you with your spiritual journey</p>
                    <div class="footer-links">
                        <a href="mailto:support@ujjainyatra.com" class="footer-link">📧 Email Support</a>
                        <a href="#" class="footer-link">🌐 Visit Website</a>
                        <a href="#" class="footer-link">Contact Us</a>
                    </div>
                    <div class="footer-divider"></div>
                    <div class="footer-bottom">
                        <p>© 2024 Ujjain Yatra. All rights reserved.</p>
                        <p>This email was sent to ${email} • <a href="#">Privacy Policy</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  const mailOptions = {
    from: `"Ujjain Yatra" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🕉️ Email Verification Code - Ujjain Yatra",
    html,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send reset password email to client
 * @param {string} email - Client's email address
 * @param {string} resetToken - JWT reset token
 */
export const sendResetPasswordEmail = async (email, resetToken) => {
  const mailOptions = {
    from: `"Ujjain Yatra" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Ujjain Yatra Password",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Ujjain Yatra</title>
        <style>
            body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);margin:0;padding:20px}
            .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,.25)}
            .header{background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);padding:40px 30px;text-align:center;color:#fff}
            .content{padding:40px 30px}
            .button{display:inline-block;background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);color:#fff;text-decoration:none;padding:16px 32px;border-radius:50px;font-weight:600;margin:20px 0}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Ujjain Yatra</h1>
                <p>Password Reset Request</p>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your Ujjain Yatra account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="http://yourdomain.com/reset?token=${resetToken}" class="button">Reset Password</a>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p>This link will expire in 1 hour for security purposes.</p>
            </div>
        </div>
    </body>
    </html>`,
  };
  await transport.sendMail(mailOptions);
};
