import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import BASE_URL from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store email in AsyncStorage
        await AsyncStorage.setItem("userEmail", email); // <--- store email
        // Optionally store name too
        await AsyncStorage.setItem("userName", data.user.name);

        //check if email is stored correctly
        const test = await AsyncStorage.getItem("userEmail");
        console.log("Saved email:", test);
        //check if name is stored correctly
        const testName = await AsyncStorage.getItem("userName");
        console.log("Saved name:", testName);

        Alert.alert("Success", data.message);

        // tiny delay to make sure write finishes
        await new Promise((resolve) => setTimeout(resolve, 50));
        router.push("/(tab)"); // Navigate to main app
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
            paddingTop: 30,
            paddingBottom: 30,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ position: "absolute", left: 0 }}
              >
                <Ionicons name="chevron-back" size={28} color="black" />
              </TouchableOpacity>
              <Text style={styles.brandName}>Zanosa</Text>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to stay connected
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="yourname@example.com"
                placeholderTextColor="#A0AABF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0AABF"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#7D8699"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity
              style={styles.footer}
              onPress={() => router.push("/stack/signup")}
            >
              <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { paddingHorizontal: 25 },
  logoSection: { alignItems: "center", marginBottom: 20 },
  brandName: { fontSize: 22, fontWeight: "800" },
  welcomeSection: { alignItems: "center", marginBottom: 30 },
  welcomeTitle: { fontSize: 28, fontWeight: "800", marginBottom: 5 },
  welcomeSubtitle: { fontSize: 15, color: "#7D8699" },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 15 },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 30,
    height: 55,
    paddingRight: 20,
  },
  passwordInput: { flex: 1, paddingHorizontal: 20 },
  loginBtn: {
    backgroundColor: "#318CE7",
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginTop: 10,
  },
  loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  footer: { marginTop: 30, alignSelf: "center" },
  footerText: { color: "#7D8699" },
  signUpLink: { color: "#318CE7", fontWeight: "700" },
});
