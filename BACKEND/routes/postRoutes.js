import express from "express";
import { createPost, getUserPosts, getAllPosts, likePost, addComment, getPostsByUser, deletePost } from "../controllers/postController.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", upload.single("image"), auth, createPost);
router.post("/upload-chat-image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided" });
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    res.status(200).json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/my-posts", auth, getUserPosts);
router.get("/user/:userId", auth, getPostsByUser);
router.get("/", auth, getAllPosts);
router.put("/:id/like", auth, likePost);
router.post("/:id/comment", auth, addComment);
router.delete("/:id", auth, deletePost);

export default router;