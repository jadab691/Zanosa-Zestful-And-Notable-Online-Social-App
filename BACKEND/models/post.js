import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    caption: String,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);