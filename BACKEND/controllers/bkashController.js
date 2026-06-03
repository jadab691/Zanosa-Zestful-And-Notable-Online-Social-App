import path from "path";

// Mock database or memory store for payments
const paymentsDb = new Map();

// Generate a random Transaction ID
const generateTrxID = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if credentials are present
const isConfigured = () => {
  return (
    process.env.BKASH_APP_KEY &&
    process.env.BKASH_APP_SECRET &&
    process.env.BKASH_USERNAME &&
    process.env.BKASH_PASSWORD
  );
};

// Get API base URL
const getBkashBaseUrl = () => {
  return process.env.BKASH_IS_SANDBOX === "false"
    ? "https://tokenized.pay.bka.sh/v1.2.0-beta"
    : "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
};

// 1. Create Payment
export const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    const paymentId = "BK_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    if (!isConfigured()) {
      // Simulation Mode
      const simulatedUrl = `${backendUrl}/api/bkash/simulator?paymentID=${paymentId}&amount=${amount}`;
      paymentsDb.set(paymentId, {
        paymentID: paymentId,
        amount: amount,
        status: "Initiated",
        createdAt: new Date(),
      });
      return res.status(200).json({
        success: true,
        isSimulated: true,
        bkashURL: simulatedUrl,
        paymentID: paymentId,
      });
    }

    // Real bKash Integration
    const tokenResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
      },
      body: JSON.stringify({
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.id_token) {
      return res.status(500).json({ error: "Failed to obtain bKash token", details: tokenData });
    }

    const callbackURL = `${backendUrl}/api/bkash/callback`;

    const createResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: tokenData.id_token,
        "X-APP-Key": process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: "ZanosaDonation",
        callbackURL: callbackURL,
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantAssociationInfo: "ZanosaSocialApp",
      }),
    });

    const createData = await createResponse.json();
    if (createData.statusCode && createData.statusCode !== "0000") {
      return res.status(400).json({ error: createData.statusMessage, details: createData });
    }

    return res.status(200).json({
      success: true,
      isSimulated: false,
      bkashURL: createData.bkashURL,
      paymentID: createData.paymentID,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 2. Callback Redirect Handler
export const callback = async (req, res) => {
  const { paymentID, status } = req.query;

  // Mobile app expects frontend://stack/donate?status=...&paymentID=...
  const redirectUrl = `frontend://stack/donate`;

  if (status === "success") {
    if (!isConfigured()) {
      const payment = paymentsDb.get(paymentID);
      if (payment) {
        payment.status = "Completed";
        payment.trxID = "MOCK" + generateTrxID();
        paymentsDb.set(paymentID, payment);
        return res.redirect(`${redirectUrl}?status=success&trxID=${payment.trxID}&amount=${payment.amount}`);
      }
      return res.redirect(`${redirectUrl}?status=failure&message=Payment not found`);
    }

    // For real integration, execute the payment first
    try {
      // 1. Get grant token
      const tokenResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/token/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
        body: JSON.stringify({
          app_key: process.env.BKASH_APP_KEY,
          app_secret: process.env.BKASH_APP_SECRET,
        }),
      });
      const tokenData = await tokenResponse.json();

      // 2. Execute Payment
      const executeResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenData.id_token,
          "X-APP-Key": process.env.BKASH_APP_KEY,
        },
        body: JSON.stringify({ paymentID }),
      });
      const executeData = await executeResponse.json();

      if (executeData.statusCode === "0000" && executeData.transactionStatus === "Completed") {
        return res.redirect(`${redirectUrl}?status=success&trxID=${executeData.trxID}&amount=${executeData.amount}`);
      } else {
        return res.redirect(`${redirectUrl}?status=failure&message=${executeData.statusMessage || "Execution failed"}`);
      }
    } catch (err) {
      return res.redirect(`${redirectUrl}?status=failure&message=Execution error`);
    }
  } else if (status === "cancel") {
    return res.redirect(`${redirectUrl}?status=cancel`);
  } else {
    return res.redirect(`${redirectUrl}?status=failure&message=Payment failed or cancelled`);
  }
};

// 3. Serve Simulator HTML page
export const simulator = (req, res) => {
  const { paymentID, amount } = req.query;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>bKash Payment Simulator</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #f3f4f6;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
    }
    .bkash-pink {
      background-color: #E2136E;
    }
    .bkash-text-pink {
      color: #E2136E;
    }
  </style>
</head>
<body class="flex flex-col min-h-screen bg-gray-100">
  <!-- Header Banner -->
  <div class="bkash-pink py-4 px-6 flex justify-between items-center text-white shadow-md">
    <div class="flex items-center space-x-2">
      <span class="text-2xl font-bold tracking-wider">bKash</span>
      <span class="text-xs border border-white px-1 rounded">SIMULATOR</span>
    </div>
    <div class="text-right">
      <p class="text-xs opacity-90">Merchant: Zanosa Social App</p>
      <p class="text-lg font-bold">BDT ${amount}</p>
    </div>
  </div>

  <div class="flex-1 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-150">
      
      <!-- Logo Container -->
      <div class="flex justify-center bg-gray-50 py-6 border-b border-gray-100">
        <div class="bkash-pink w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-sm">
          b
        </div>
      </div>

      <!-- Payment Steps -->
      <div class="p-6">
        <!-- Step 1: Wallet Number -->
        <div id="step-number">
          <h2 class="text-center text-gray-700 font-semibold text-lg mb-4">Your bKash Account Number</h2>
          <label class="block text-sm font-medium text-gray-500 mb-1">e.g. 01XXXXXXXXX</label>
          <input type="tel" id="bkash-wallet" placeholder="e.g. 01712345678" maxlength="11"
            class="w-full border-2 border-gray-300 rounded-lg p-3 text-center text-xl font-semibold tracking-widest focus:outline-none focus:border-pink-500 transition-colors"
          />
          <p class="text-xs text-gray-400 mt-2 text-center">By clicking Proceed, you agree to terms & conditions.</p>
        </div>

        <!-- Step 2: OTP (Hidden initially) -->
        <div id="step-otp" class="hidden">
          <h2 class="text-center text-gray-700 font-semibold text-lg mb-2">bKash Verification Code</h2>
          <p class="text-xs text-center text-gray-500 mb-4">A simulated 6-digit OTP has been sent to your mobile</p>
          <input type="password" id="otp-input" placeholder="XXXXXX" maxlength="6"
            class="w-full border-2 border-gray-300 rounded-lg p-3 text-center text-xl font-semibold tracking-widest focus:outline-none focus:border-pink-500 transition-colors"
          />
          <button onclick="resendOtp()" class="w-full text-center text-xs bkash-text-pink hover:underline mt-2 font-medium">Resend Code</button>
        </div>

        <!-- Step 3: PIN (Hidden initially) -->
        <div id="step-pin" class="hidden">
          <h2 class="text-center text-gray-700 font-semibold text-lg mb-2">Enter PIN</h2>
          <p class="text-xs text-center text-gray-500 mb-4">Please enter your 5-digit bKash wallet PIN</p>
          <input type="password" id="pin-input" placeholder="XXXXX" maxlength="5"
            class="w-full border-2 border-gray-300 rounded-lg p-3 text-center text-xl font-semibold tracking-widest focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <!-- Error box -->
        <div id="error-box" class="hidden mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium"></div>

        <!-- Actions -->
        <div class="mt-8 flex space-x-4">
          <button id="btn-cancel" onclick="cancelPayment()" class="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
            CLOSE
          </button>
          <button id="btn-proceed" onclick="nextStep()" class="flex-1 bkash-pink text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
            PROCEED
          </button>
        </div>
      </div>
      
      <!-- Footer Info -->
      <div class="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-150 text-xs text-gray-400">
        <span>Payment ID: ${paymentID}</span>
        <span class="flex items-center space-x-1">
          <span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
          <span>Secure Mode</span>
        </span>
      </div>

    </div>
  </div>

  <script>
    let currentStep = 1;
    const paymentID = "${paymentID}";

    function showError(msg) {
      const errorBox = document.getElementById("error-box");
      errorBox.innerText = msg;
      errorBox.classList.remove("hidden");
    }

    function hideError() {
      document.getElementById("error-box").classList.add("hidden");
    }

    function cancelPayment() {
      window.location.href = "/api/bkash/callback?paymentID=" + paymentID + "&status=cancel";
    }

    function nextStep() {
      hideError();
      if (currentStep === 1) {
        const wallet = document.getElementById("bkash-wallet").value.trim();
        if (wallet.length !== 11 || !wallet.startsWith("01")) {
          showError("Enter a valid 11-digit bKash number starting with 01");
          return;
        }
        document.getElementById("step-number").classList.add("hidden");
        document.getElementById("step-otp").classList.remove("hidden");
        currentStep = 2;
      } else if (currentStep === 2) {
        const otp = document.getElementById("otp-input").value.trim();
        if (otp.length < 4) {
          showError("Please enter verification code");
          return;
        }
        document.getElementById("step-otp").classList.add("hidden");
        document.getElementById("step-pin").classList.remove("hidden");
        currentStep = 3;
      } else if (currentStep === 3) {
        const pin = document.getElementById("pin-input").value.trim();
        if (pin.length < 4) {
          showError("Please enter valid PIN");
          return;
        }
        window.location.href = "/api/bkash/callback?paymentID=" + paymentID + "&status=success";
      }
    }

    function resendOtp() {
      alert("Simulated OTP sent successfully!");
    }
  </script>
</body>
</html>
  `;
  res.send(html);
};

// 4. Mock Verify Manual Transaction
export const verifyManualPayment = (req, res) => {
  const { trxID, amount } = req.body;
  if (!trxID || trxID.trim().length < 8) {
    return res.status(400).json({ error: "Invalid Transaction ID format." });
  }
  
  return res.status(200).json({
    success: true,
    message: "Transaction verification successful!",
    data: {
      trxID: trxID.toUpperCase(),
      amount: amount || "100",
      status: "Verified",
      date: new Date().toISOString()
    }
  });
};
