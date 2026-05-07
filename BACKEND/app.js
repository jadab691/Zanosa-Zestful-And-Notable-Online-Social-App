import express from "express";
const app = express();
import cors from "cors";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";  // ADD THIS

app.get("/", (req, res) => {
  res.send("Zanosa api is running successfully");
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);  // ADD THIS

export default app;
