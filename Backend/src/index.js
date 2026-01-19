import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

// ✅ Render health check friendly
app.get("/", (req, res) => {
  res.status(200).send("Expense Splitter Backend is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});

// ✅ DB connect background me
connectDB()
  .then(() => {
    console.log("MongoDB connected ✅");
  })
  .catch((err) => {
    console.log("MongoDB connection failed ❌", err?.message || err);
  });
