import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  trxID: {
    type: String,
    required: true,
    unique: true,
  },
  paymentMethod: {
    type: String,
    enum: ["online", "manual_bkash"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
