import express from "express";
const app = express();
import cors from "cors";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js"; 
import adminRoutes from "./routes/adminRoutes.js";

app.get("/", (req, res) => {
  res.send("Zanosa api is running successfully");
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

export default app;
 