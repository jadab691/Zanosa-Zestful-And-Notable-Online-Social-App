import express from "express";
import User from "../models/users.js";
import Post from "../models/post.js";
import Admin from "../models/admin.js";
import Donation from "../models/donation.js";

const router = express.Router();

// POST admin login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        if (admin.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        res.json({ message: "Login successful", name: admin.name, email: admin.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET tootal user number . 
router.get("/total-users", async (req, res) => {
    try {
        const count = await User.countDocuments();
        const post = await Post.countDocuments();
        // const report = await report.countDocuments(); // not using now  
        res.json({ totalUsers: count, totalPosts: post, /*totalReports: report */ });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});




//get total user info . 
router.get("/users-data", async (req, res) => {
    try {
        const users = await User.find();

        const result = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            const postCount = await Post.countDocuments({
                user: user._id,
            });

            result.push({
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                profilePic: user.profilePic,
                postCount: postCount,
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//see the post, caption , and the poster name  . 

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePic") // 👈 important
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a user and all of their posts
router.delete("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        await Post.deleteMany({ user: userId });
        
        res.json({ message: "User and their posts deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE a specific post
router.delete("/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all donations sorted by date
router.get("/donations", async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH update donation status (approve/reject)
router.patch("/donations/:id", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["success", "failed", "pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.json({ message: `Donation status updated to ${status}`, donation });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;