import express from "express";
import { createPost, getUserPosts, getAllPosts, likePost, addComment, getPostsByUser } from "../controllers/postController.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", upload.single("image"), auth, createPost);
router.get("/my-posts", auth, getUserPosts);
router.get("/user/:userId", auth, getPostsByUser);
router.get("/", auth, getAllPosts);
router.put("/:id/like", auth, likePost);
router.post("/:id/comment", auth, addComment);

export default router;