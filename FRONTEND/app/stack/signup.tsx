import { Ionicons } from "@expo/vector-icons";
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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        router.push("/stack/login");
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
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color="black" />
              </TouchableOpacity>
              <Text style={styles.brandName}>Zanosa</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Create Account</Text>
              <Text style={styles.subtitleText}>Join our community today</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#A0AABF"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
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
                  placeholder="Create a password"
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

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/stack/login")}
            >
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.link}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  inner: { flex: 1, paddingHorizontal: 25 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  brandName: { fontSize: 22, fontWeight: "800", color: "#1A1C1E" },
  titleSection: { alignItems: "center", marginTop: 40, marginBottom: 30 },
  titleText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  subtitleText: { fontSize: 16, color: "#7D8699" },
  form: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 25,
    height: 55,
    paddingRight: 20,
  },
  passwordInput: { flex: 1, paddingHorizontal: 20 },
  button: {
    backgroundColor: "#318CE7",
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  loginLink: { marginTop: "auto", marginBottom: 20, alignSelf: "center" },
  footerText: { fontSize: 14, color: "#7D8699", paddingBottom: 40 },
  link: { color: "#318CE7", fontWeight: "600" },
});
