import nodemailer from "nodemailer";
import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

let transporter: any;

if (isProduction) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  transporter = {
    sendMail: async (options: any) => {
      console.log("\n📧 Verification Email (Development)");
      console.log("━".repeat(50));
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(
        `\nVerification Code: ${
          options.html.match(/(\d{6})/)?.[1] || "N/A"
        }`
      );
      console.log("━".repeat(50) + "\n");
      return { messageId: "dev-" + Date.now() };
    },
  };
}

export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<void> => {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    console.log("📧 Preparing email for:", email);
    console.log("🔑 OTP:", code);

    if (serviceId && templateId && publicKey && privateKey) {
      console.log("📧 Sending via EmailJS API...");

      await axios.post(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: {
            to_email: email,   // MUST match {{to_email}} in EmailJS
            code: code,        // MUST match {{code}} in EmailJS
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("✅ EmailJS email sent to:", email);
      return;
    }

    console.warn(
      "⚠️ EmailJS config missing — falling back to Nodemailer SMTP."
    );

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@fusionconnect.com",
      to: email,
      subject: "FusionConnect Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
          <h2>FusionConnect Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:6px;margin:20px 0;">
            ${code}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this email, please ignore it.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Nodemailer email sent to:", email);
  } catch (err) {
    console.error("❌ Email sending failed:", err);
  }
};