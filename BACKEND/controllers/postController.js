import Post from "../models/post.js";

export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl =
      req.file.path ||
      req.file.secure_url ||
      req.file.url;

    const post = new Post({
      user: req.user.id || req.user._id,
      caption,
      image: imageUrl,
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id || req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};