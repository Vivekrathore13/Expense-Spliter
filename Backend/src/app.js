import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userrouter from "./routes/user.routes.js";
import grouprouter from "./routes/group.routes.js";
import expenserouter from "./routes/expense.routes.js";
import settlementrouter from "./routes/settlement.routes.js";
import notificationrouter from "./routes/notification.routes.js";
import summaryRoutes from "./routes/summary.routes.js";

const app = express();

// ✅ allow preview vercel URLs
const isVercelPreview = (origin) => {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // ✅ allow production + preview vercel
      if (allowedOrigins.includes(origin) || isVercelPreview(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
app.use("/api", userrouter);
app.use("/api", grouprouter);
app.use("/api", expenserouter);
app.use("/api", settlementrouter);
app.use("/api/notifications", notificationrouter);
app.use("/api", summaryRoutes);

export { app };
