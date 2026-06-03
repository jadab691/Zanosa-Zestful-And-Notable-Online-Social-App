import express from "express";
import {
  initPayment,
  successCallback,
  failCallback,
  cancelCallback,
  ipnCallback,
  serveSimulator,
  verifyManualPayment,
} from "../controllers/sslcommerzController.js";

const router = express.Router();

// SSLCommerz payment endpoints
router.post("/init", initPayment);
router.post("/success", successCallback);
router.post("/fail", failCallback);
router.post("/cancel", cancelCallback);
router.post("/ipn", ipnCallback);

// Simulator view
router.get("/simulator", serveSimulator);

// Manual verification submission
router.post("/verify-manual", verifyManualPayment);

export default router;
