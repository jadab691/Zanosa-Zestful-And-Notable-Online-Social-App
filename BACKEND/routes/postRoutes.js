import express from "express";
import { createPost, getUserPosts } from "../controllers/postController.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", upload.single("image"), auth, createPost);
router.get("/my-posts", auth, getUserPosts);

export default router;