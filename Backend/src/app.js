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

// ✅ allow ALL vercel deployments + localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // postman/curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.includes(".vercel.app")) return callback(null, true);

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ ONLY this is enough
app.use(cors(corsOptions));

// ✅ OPTIONAL: handle OPTIONS without crash
// app.use((req, res, next) => {
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

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
