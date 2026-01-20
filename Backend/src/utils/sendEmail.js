import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // ✅ Verified sender
  const fromEmail = process.env.SMTP_FROM || user;
  const fromName = process.env.SMTP_FROM_NAME || "Expense Splitter";

  try {
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

    // ✅ secure:
    // 465 -> secure true
    // 587 -> secure false + STARTTLS
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },

      // ✅ MUST for 587 (STARTTLS)
      requireTLS: port === 587,
      ignoreTLS: false,

      // ✅ Render stable timeouts
      connectionTimeout: 60000, // 60 sec
      greetingTimeout: 60000,
      socketTimeout: 60000,

      // ✅ safer TLS
      tls: {
        servername: host,
        minVersion: "TLSv1.2",
      },
    });

    // ✅ Debug verify
    console.log("📨 SMTP Verify start...", { host, port, secure });
    await transporter.verify();
    console.log("✅ SMTP Verified OK");

    // ✅ Send mail
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", {
      messageId: info.messageId,
      to,
    });

    return info;
  } catch (err) {
    console.log("❌ Nodemailer Full Error:", {
      message: err?.message,
      code: err?.code,
      command: err?.command,
      response: err?.response,
      stack: err?.stack,
    });

    throw new Error(err?.message || "Failed to send email");
  }
};
