import User from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import EmailVerification from "../models/emailVerification.js";
import Message from "../models/message.js";

// ================= SIGNUP =================
export const signup = async (req, res) => {
  console.log("🔥 Signup API hit");
  console.log(req.body);

  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Check if OTP is required (if user already verified, skip)
    if (!otp) {
      // Generate 4-digit OTP
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      // Upsert verification record
      await EmailVerification.findOneAndUpdate(
        { email },
        { code: generatedOtp, expiresAt },
        { upsert: true, new: true }
      );
      // Send email
      await sendEmail({
        to: email,
        subject: "Your verification code",
        text: `Your verification code is ${generatedOtp}`
      });
      return res.status(200).json({ message: "OTP sent to email" });
    }

    // Verify OTP
    const verification = await EmailVerification.findOne({ email, code: otp });
    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    // Cleanup verification
    await EmailVerification.deleteOne({ email });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  console.log("Login API hit");
  console.log(req.body);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔥 CREATE JWT TOKEN (THIS IS WHAT YOU ASKED EARLIER)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};
    const users = await User.find(query, "name email _id profilePic");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;
    if (currentUserId === targetId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = currentUser.following.includes(targetId);
    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(currentUserId);
    }
    await currentUser.save();
    await targetUser.save();
    res.status(200).json({ following: !isFollowing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET USER BY ID =================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select("-password"); //select except password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= UPDATE PROFILE PIC =================
export const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl =
      req.file.path ||
      req.file.secure_url ||
      req.file.url;

    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      { profilePic: imageUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: user.profilePic,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET FOLLOWERS =================
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name profilePic email _id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.followers || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET FOLLOWING =================
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name profilePic email _id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.following || []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET CHATTED USERS =================
export const getChattedUsers = async (req, res) => {
  try {
    const currentEmail = req.user.email;
    if (!currentEmail) {
      return res.status(400).json({ message: "User email not found" });
    }
    const messages = await Message.find({
      $or: [
        { senderEmail: currentEmail },
        { receiverEmail: currentEmail }
      ]
    }).select("senderEmail receiverEmail");

    const chattedEmails = new Set();
    messages.forEach(msg => {
      if (msg.senderEmail !== currentEmail) chattedEmails.add(msg.senderEmail);
      if (msg.receiverEmail !== currentEmail) chattedEmails.add(msg.receiverEmail);
    });

    const users = await User.find(
      { email: { $in: Array.from(chattedEmails) } },
      "name email _id profilePic"
    );
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};