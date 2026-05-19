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
    const posts = await Post.find({ user: req.user.id || req.user._id })
      .populate("user", "name email profilePic")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "name email profilePic")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email profilePic")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id || req.user._id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    await post.populate("user", "name email profilePic");
    await post.populate("comments.user", "name");
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: req.user.id || req.user._id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    await post.populate("user", "name email profilePic");
    await post.populate("comments.user", "name");

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};