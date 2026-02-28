import express from "express";
import { getProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", getProfile);

export default router;
