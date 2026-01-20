import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiKey = (process.env.BREVO_API_KEY || "").trim();
    const fromEmail = (process.env.SMTP_FROM || "").trim();
    const fromName = (process.env.SMTP_FROM_NAME || "Expense Splitter").trim();

    // ✅ DEBUG BEFORE REQUEST
    console.log("🔑 BREVO key exists?", !!apiKey);
    console.log("🔑 BREVO key prefix:", apiKey.slice(0, 10));
    console.log("📩 FROM:", { fromEmail, fromName });

    if (!apiKey) {
      throw new Error("BREVO_API_KEY missing in environment variables");
    }

    if (!fromEmail) {
      throw new Error("SMTP_FROM missing in environment variables");
    }

    const payload = {
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    console.log("📨 Sending email via Brevo API...", { to, subject });

    const res = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        Accept: "application/json",
        "api-key": apiKey, // ✅ correct
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    console.log("✅ Brevo API Email sent successfully:", res.data);
    return res.data;
  } catch (err) {
    console.log("❌ Brevo API Email Error:", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    throw new Error(
      err?.response?.data?.message || err?.message || "Failed to send email"
    );
  }
};
