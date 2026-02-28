import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import BASE_URL from "@/config/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("Example User");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // First, try to get the stored name
        const storedName = await AsyncStorage.getItem("userName");
        console.log("ProfileScreen: storedName =", storedName);

        if (storedName) {
          setName(storedName);
          return;
        }

        // If name not stored, fetch from backend using email
        const email = await AsyncStorage.getItem("userEmail");
        console.log("ProfileScreen: email =", email);
        if (!email) return;

        const response = await fetch(`${BASE_URL}/user/profile?email=${email}`);
        const data = await response.json();
        console.log("ProfileScreen: backend data =", data);

        if (data?.name) {
          setName(data.name);
          await AsyncStorage.setItem("userName", data.name);
        }
      } catch (err) {
        console.log("Error loading profile:", err);
      }
    };

    loadProfile();
  }, []);

  const myPostedImages = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=60",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=60",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.bio}>Less perfection, more authenticity. ✨</Text>
        </View>

        <View style={styles.grid}>
          {myPostedImages.map((imgUri, index) => (
            <Image
              key={index}
              source={{ uri: imgUri }}
              style={styles.gridImage}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    marginHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  iconButton: { padding: 5 },
  profileSection: { alignItems: "center", marginTop: 20 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  userName: { fontSize: 22, fontWeight: "800", marginTop: 15 },
  bio: {
    textAlign: "center",
    color: "#7D8699",
    marginTop: 10,
    paddingHorizontal: 40,
  },
  grid: {
    paddingTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "space-between",
  },
  gridImage: {
    width: width / 3 - 20,
    height: 130,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#f2f2f2",
  },
});
