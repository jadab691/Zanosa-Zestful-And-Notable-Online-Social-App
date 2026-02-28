import User from "../models/User.js";

// GET /user/profile?email=someone@example.com
export const getProfile = async (req, res) => {
  try {
    const { email } = req.query; // get email from query
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email } , {name : 1, _id: 0}); // find user by email, return only name
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user }); // send user object
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
