import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465; // ✅ 465 = true, 587 = false

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure, // ✅ true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      // ✅ Timeouts (Render par ETIMEDOUT fix ke liye)
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,

      // ✅ Important for 587 (STARTTLS)
      requireTLS: port === 587,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // ✅ verify connection (helps debug)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Expense Splitter" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.log("❌ Nodemailer Error:", err?.message || err);
    throw new Error(err?.message || "Failed to send invitation email");
  }
};
