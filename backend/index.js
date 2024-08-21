import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});

app.use(express.json()); // json parse incoming requests
app.use(cookieParser()); // json parse incoming cookies

app.use("/api/auth", authRoutes)
