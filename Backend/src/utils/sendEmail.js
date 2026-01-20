import axios from "axios";

/**
 * Send Email using Brevo HTTP API (No SMTP)
 * Works perfectly on Render (SMTP ports are blocked)
 *
 * Required ENV:
 * BREVO_API_KEY
 * SMTP_FROM
 * SMTP_FROM_NAME
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiKey = (process.env.BREVO_API_KEY || "").trim();
    const fromEmail = (process.env.SMTP_FROM || "").trim();
    const fromName = (process.env.SMTP_FROM_NAME || "Expense Splitter").trim();

    // ✅ Validate ENV
    if (!apiKey) {
      console.log("❌ BREVO_API_KEY missing in env");
      throw new Error("BREVO_API_KEY missing in environment variables");
    }

    if (!fromEmail) {
      console.log("❌ SMTP_FROM missing in env");
      throw new Error("SMTP_FROM missing in environment variables");
    }

    // ✅ Optional debug (keep it for now, can remove later)
    console.log("🔑 Brevo Key Prefix:", apiKey.slice(0, 10)); // should show xkeysib-
    console.log("📩 Sending email via Brevo API:", { to, subject });

    const payload = {
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        timeout: 20000,
      }
    );

    console.log("✅ Brevo Email sent successfully:", res.data);
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
