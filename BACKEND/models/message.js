import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderEmail: {
    type: String,
    required: true,
  },
  receiverEmail: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Message", messageSchema);
