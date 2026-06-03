import express from "express";
import {
  createPayment,
  callback,
  simulator,
  verifyManualPayment,
} from "../controllers/bkashController.js";

const router = express.Router();

// bKash PGW actions
router.post("/create", createPayment);
router.get("/callback", callback);
router.get("/simulator", simulator);

// Manual verification
router.post("/verify-manual", verifyManualPayment);

export default router;
