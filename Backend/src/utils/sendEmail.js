import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // ✅ validate env
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.log("❌ SMTP env missing:", {
        SMTP_HOST: !!host,
        SMTP_PORT: port,
        SMTP_USER: !!user,
        SMTP_PASS: !!pass,
      });
      throw new Error("SMTP credentials missing in environment variables");
    }

    // ✅ Correct secure flag
    // port 465 => secure true
    // port 587/25 => secure false (STARTTLS)
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },

      // ✅ IMPORTANT (Render / Cloud)
      connectionTimeout: 15000, // 15 sec
      greetingTimeout: 15000,
      socketTimeout: 20000,

      tls: {
        rejectUnauthorized: false,
      },
    });

    // ✅ verify before sending (helps debug)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Expense Splitter" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.log("❌ Nodemailer Full Error:", err);
    throw new Error(err?.message || "Failed to send invitation email");
  }
};
