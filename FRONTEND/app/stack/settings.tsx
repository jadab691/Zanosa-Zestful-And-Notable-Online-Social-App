import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [bio, setBio] = useState("");
  const [newBio, setNewBio] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) { setName(data.name); setNewName(data.name); }
          if (data.bio) { setBio(data.bio); setNewBio(data.bio); }
        }
      } catch (e) {
        console.log("Settings load error", e);
      }
    };
    load();
  }, []);

  const handleSave = async (type: "name" | "bio") => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return Alert.alert("Not logged in");

    type === "name" ? setSavingName(true) : setSavingBio(true);
    try {
      const body = type === "name" ? { name: newName } : { bio: newBio };
      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (type === "name") {
          setName(data.name);
          await AsyncStorage.setItem("userName", data.name);
          Alert.alert("✅ Success", "Name updated successfully");
        } else {
          setBio(data.bio);
          Alert.alert("✅ Success", "Bio updated successfully");
        }
      } else {
        Alert.alert("Error", data.message || "Failed to update");
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      type === "name" ? setSavingName(false) : setSavingBio(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Back + Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* ── Theme ── */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 13 }}>Toggle dark / light theme</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={theme === "dark" ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={theme === "dark"}
          />
        </View>

        {/* ── Edit Name ── */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Account</Text>
        <View
          style={[
            styles.editCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setShowNameEdit(!showNameEdit)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={[styles.editCardTitle, { color: colors.text }]}>
                Want to edit name?
              </Text>

              <Text
                style={{
                  color: colors.text,
                  opacity: 0.55,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Current: {name}
              </Text>
            </View>

            <Ionicons
              name={showNameEdit ? "chevron-up" : "chevron-down"}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          {showNameEdit && (
            <View style={{ marginTop: 15 }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new name"
                placeholderTextColor={colors.text + "88"}
              />

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => handleSave("name")}
                disabled={
                  savingName || newName.trim() === name.trim()
                }
              >
                {savingName ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    Save Name
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Edit Bio ── */}
        <View
          style={[
            styles.editCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setShowBioEdit(!showBioEdit)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.editCardTitle, { color: colors.text }]}>
                Want to edit bio?
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: colors.text,
                  opacity: 0.55,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Current: {bio || "No bio yet"}
              </Text>
            </View>

            <Ionicons
              name={showBioEdit ? "chevron-up" : "chevron-down"}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          {showBioEdit && (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, justifyContent: "center" }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
              <View style={{ marginTop: 15 }}>
                <TextInput
                  style={[
                    styles.input,
                    styles.bioInput,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  value={newBio}
                  onChangeText={setNewBio}
                  placeholder="Write something about yourself..."
                  placeholderTextColor={colors.text + "88"}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handleSave("bio")}
                  disabled={savingBio || newBio.trim() === bio.trim()}
                >
                  {savingBio ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Bio</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

};



export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  editCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 2,
  },
  editCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  bioInput: {
    minHeight: 80,
  },
  saveBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
