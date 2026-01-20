import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // ✅ IMPORTANT: Use a verified sender email in Brevo
    // Add this in Render ENV: SMTP_FROM=your_verified_sender@yourdomain.com
    const fromEmail = process.env.SMTP_FROM || user;
    const fromName = process.env.SMTP_FROM_NAME || "Expense Splitter";

    if (!user || !pass) {
      console.log("❌ SMTP env missing:", {
        SMTP_HOST: host,
        SMTP_PORT: port,
        SMTP_USER: !!user,
        SMTP_PASS: !!pass,
        SMTP_FROM: !!process.env.SMTP_FROM,
      });
      throw new Error("SMTP credentials missing in environment variables");
    }

    // ✅ Correct secure flag:
    // - port 465: secure true (SSL)
    // - port 587: secure false (STARTTLS)
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },

      // ✅ Render / Cloud stable config
      requireTLS: port === 587, // force STARTTLS on 587

      connectionTimeout: 30000, // 30s
      greetingTimeout: 30000,
      socketTimeout: 45000,

      tls: {
        // ✅ important for some clouds
        servername: host,
      },
    });

    // ✅ verify transport
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.log("❌ Nodemailer Full Error:", err);
    throw new Error(err?.message || "Failed to send email");
  }
};
