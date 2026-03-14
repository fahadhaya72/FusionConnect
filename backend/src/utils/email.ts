import nodemailer from 'nodemailer';

// For development: use console logging
// For production: configure proper SMTP service
const isProduction = process.env.NODE_ENV === 'production';

let transporter: any;

// Initialize transporter based on environment
if (isProduction) {
  // Production: Use actual email service
  transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  // Development: Use test account (prints to console)
  transporter = {
    sendMail: async (options: any) => {
      console.log('\n📧 Verification Email (Development)');
      console.log('━'.repeat(50));
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`\nVerification Code: ${options.html.match(/(\d{6})/)?.[1] || 'N/A'}`);
      console.log('━'.repeat(50) + '\n');
      return { messageId: 'dev-' + Date.now() };
    }
  };
}

export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@fusionconnect.com',
      to: email,
      subject: 'FusionConnect - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FusionConnect!</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Don't throw - let registration succeed even if email fails
    // In development, code is logged to console above
  }
};