import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import API from "../../config/api";

// Preset donation amounts
const PRESETS = [50, 100, 500, 1000];

export default function Donate() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  // State
  const [amount, setAmount] = useState<string>("100");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"automatic" | "manual">("automatic");
  const [loading, setLoading] = useState<boolean>(false);
  const [trxID, setTrxID] = useState<string>("");
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  
  // User info state
  const [userName, setUserName] = useState<string>("Guest User");
  const [userEmail, setUserEmail] = useState<string>("guest@zanosa.com");

  // Success screen state
  const [successData, setSuccessData] = useState<{
    trxID: string;
    amount: string;
  } | null>(null);

  // Load user session details on mount
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedName = await AsyncStorage.getItem("userName");
        if (storedEmail) setUserEmail(storedEmail);
        if (storedName) setUserName(storedName);
      } catch (err) {
        console.warn("Could not retrieve user session details", err);
      }
    };
    loadUserSession();
  }, []);

  // Handle deep link redirect parameters when the browser returns
  useEffect(() => {
    if (params.status === "success") {
      setSuccessData({
        trxID: (params.trxID as string) || "N/A",
        amount: (params.amount as string) || amount,
      });
    } else if (params.status === "cancel") {
      Alert.alert("Payment Cancelled", "You have cancelled the payment process.");
    } else if (params.status === "failure") {
      Alert.alert("Payment Failed", (params.message as string) || "Something went wrong.");
    }
  }, [params]);

  // Handle preset selection
  const selectPreset = (val: number) => {
    setAmount(val.toString());
    setCustomAmount("");
  };

  // Handle custom amount text change
  const handleCustomAmountChange = (text: string) => {
    setCustomAmount(text);
    setAmount(text);
  };

  // 1. SSLCommerz Online Payment Flow
  const handleAutomaticCheckout = async () => {
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert("Invalid Amount", "Please select or enter a valid donation amount.");
      return;
    }

    setLoading(true);
    try {
      // Create payment session on the backend passing user name and email
      const response = await API.post("/api/sslcommerz/init", { 
        amount: finalAmount,
        userName,
        userEmail
      });
      const { success, GatewayPageURL } = response.data;

      if (success && GatewayPageURL) {
        // Open the payment gateway in the device's default browser.
        // The backend will redirect back to the app via the "frontend://" deep link scheme.
        // The useEffect watching `params` will pick up the result automatically.
        await Linking.openURL(GatewayPageURL);
      } else {
        Alert.alert("Error", "Could not initialize SSLCommerz gateway.");
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      Alert.alert("Error", "Failed to connect to payment server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Manual Payment Verification Flow (DB integration)
  const handleManualVerification = async () => {
    if (!trxID || trxID.trim().length < 8) {
      Alert.alert("Invalid TrxID", "Please enter a valid bKash Transaction ID.");
      return;
    }

    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount first.");
      return;
    }

    setManualLoading(true);
    try {
      const response = await API.post("/api/sslcommerz/verify-manual", {
        trxID: trxID.trim(),
        amount: finalAmount,
        userName,
        userEmail,
      });

      if (response.data.success) {
        Alert.alert(
          "Donation Request Submitted",
          "Your transaction proof has been sent to the admin dashboard. The admin will verify it shortly."
        );
        setSuccessData({
          trxID: trxID.trim().toUpperCase(),
          amount: finalAmount.toString(),
        });
      } else {
        Alert.alert("Submission Failed", response.data.error || "Unable to register request.");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to submit request. Transaction ID might have already been used.";
      Alert.alert("Submission Error", errorMsg);
    } finally {
      setManualLoading(false);
    }
  };

  const copyNumber = () => {
    Clipboard.setString("01700000000"); // Replace with developer's personal number
    Alert.alert("Copied", "bKash personal number copied to clipboard.");
  };

  // Render Success Screen
  if (successData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center" }]}>
        <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="checkmark-circle" size={80} color="#2e7d32" />
          <Text style={[styles.successTitle, { color: colors.text }]}>Donation Submitted!</Text>
          <Text style={[styles.successSubtitle, { color: colors.text }]}>
            Thank you for supporting Zanosa Social App. {paymentMethod === "manual" ? "Your manual payment proof has been submitted for admin verification." : "Your transaction is complete."}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{successData.amount} ৳</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{successData.trxID}</Text>
          </View>

          <TouchableOpacity
            style={[styles.btnDone, { backgroundColor: colors.primary }]}
            onPress={() => {
              setSuccessData(null);
              router.replace("/(tab)/menu");
            }}
          >
            <Text style={styles.btnDoneText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Support Us</Text>
      </View>

      {/* Hero Banner */}
      <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
        <Ionicons name="heart" size={50} color="#9d5fb8" />
        <Text style={[styles.heroTitle, { color: colors.text }]}>Donate to Zanosa</Text>
        <Text style={styles.heroDescription}>
          We are committed to building a clean, secure, and awesome social network. 
          Your contributions directly cover hosting, database infrastructure, and continuous development costs.
        </Text>
      </View>

      {/* Step 1: Select Amount */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Amount (BDT)</Text>
        
        {/* Preset Buttons */}
        <View style={styles.presetContainer}>
          {PRESETS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.presetButton,
                { borderColor: colors.border },
                amount === val.toString() && { backgroundColor: "#9d5fb8", borderColor: "#9d5fb8" },
              ]}
              onPress={() => selectPreset(val)}
            >
              <Text
                style={[
                  styles.presetText,
                  { color: colors.text },
                  amount === val.toString() && { color: "#ffffff", fontWeight: "bold" },
                ]}
              >
                {val} ৳
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Input */}
        <TextInput
          style={[styles.customInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Or enter custom amount in BDT"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={customAmount}
          onChangeText={handleCustomAmountChange}
        />
      </View>

      {/* Step 2: Payment Method */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              paymentMethod === "automatic" && { borderBottomColor: "#9d5fb8", borderBottomWidth: 3 },
            ]}
            onPress={() => setPaymentMethod("automatic")}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.text },
                paymentMethod === "automatic" && { color: "#9d5fb8", fontWeight: "bold" },
              ]}
            >
              Online Payment (SSLCommerz)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              paymentMethod === "manual" && { borderBottomColor: "#9d5fb8", borderBottomWidth: 3 },
            ]}
            onPress={() => setPaymentMethod("manual")}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.text },
                paymentMethod === "manual" && { color: "#9d5fb8", fontWeight: "bold" },
              ]}
            >
              bKash Send Money
            </Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === "automatic" ? (
          /* Automatic SSLCommerz Checkout Tab */
          <View style={styles.methodBody}>
            <Text style={styles.methodDescription}>
              Donate using **bKash, Nagad, Rocket, Visa/Mastercard**, or any other mobile/card payments. Secure checkout takes place via SSLCommerz.
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#9d5fb8" style={{ marginVertical: 20 }} />
            ) : (
              <TouchableOpacity style={styles.btnPay} onPress={handleAutomaticCheckout}>
                <Text style={styles.btnPayText}>Pay Online</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Manual Transfer Tab */
          <View style={styles.methodBody}>
            <Text style={styles.methodDescription}>
              If you prefer, you can send money directly to our Personal bKash Number:
            </Text>

            {/* Account Box */}
            <View style={[styles.accountBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={styles.accountLabel}>bKash Personal Number</Text>
                <Text style={[styles.accountNumber, { color: colors.text }]}>+880 1640102335</Text>
              </View>
              <TouchableOpacity style={styles.btnCopy} onPress={copyNumber}>
                <Ionicons name="copy-outline" size={20} color="#E2136E" />
                <Text style={styles.btnCopyText}>Copy</Text>
              </TouchableOpacity>
            </View>

            {/* Instruction list */}
            <View style={styles.instructions}>
              <Text style={[styles.instructionStep, { color: colors.text }]}>1. Open bKash app or dial *247#</Text>
              <Text style={[styles.instructionStep, { color: colors.text }]}>2. Choose "Send Money"</Text>
              <Text style={[styles.instructionStep, { color: colors.text }]}>3. Enter the copied number and the selected amount</Text>
              <Text style={[styles.instructionStep, { color: colors.text }]}>4. Copy the 10-character Transaction ID (TrxID)</Text>
            </View>

            {/* Input Form */}
            <TextInput
              style={[styles.customInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Enter bKash Transaction ID (TrxID)"
              placeholderTextColor="#888"
              autoCapitalize="characters"
              value={trxID}
              onChangeText={setTrxID}
            />

            {manualLoading ? (
              <ActivityIndicator size="large" color="#9d5fb8" style={{ marginVertical: 20 }} />
            ) : (
              <TouchableOpacity style={[styles.btnVerify, { backgroundColor: colors.primary }]} onPress={handleManualVerification}>
                <Text style={styles.btnVerifyText}>Submit Verification</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  heroDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  presetContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  presetText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  methodBody: {
    paddingTop: 5,
  },
  methodDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  btnPay: {
    backgroundColor: "#9d5fb8",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#9d5fb8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  btnPayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  accountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  accountLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  btnCopy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbe9e7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCopyText: {
    color: "#E2136E",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  instructions: {
    marginBottom: 20,
  },
  instructionStep: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    opacity: 0.8,
  },
  btnVerify: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 15,
  },
  btnVerifyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successCard: {
    padding: 25,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 6,
  },
  detailLabel: {
    color: "#666",
    fontSize: 14,
  },
  detailValue: {
    fontWeight: "bold",
    fontSize: 15,
  },
  btnDone: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },
  btnDoneText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
