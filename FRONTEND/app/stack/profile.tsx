import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
// 1. useRouter import
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  // 2. routewr const declare korun
  const router = useRouter();

  const myPostedImages = [
    
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRICqHPz0Yc4zETuHSk6E8ZYG3wRwTC4Mxy1g&s",
    "https://m.media-amazon.com/images/M/MV5BNzIwMDZlMGUtYzI3NS00ODFmLTgxNmMtMzc0YmFjMmJjNTg2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    "https://images.filmibeat.com/ph-big/2025/09/aneet-padda-nyaya-courtroom-drama-fatima-sana-arjun-mathur1758024370_1.jpg",
    "https://images.news18.com/static-urdu/uloads/2025/07/Aneet-Padda-10-2025-07-c5a716363a3c392ca7845bfce65609b6.jpg",
    "https://images.news18.com/ibnkhabar/uploads/2025/07/Aneet-Padda-5-2025-07-19152fd436ae779f6bfa93057240eb6e.jpg?im=Resize,width=400,aspect=fit,type=normal",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* 3. eikhane onPress add kor  */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        {/* edit button  */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* progile info  */}
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://www.hindustantimes.com/ht-img/img/2025/12/05/400x225/Aneet_1764921997915_1764922011377.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.userName}>Aneet Padda</Text>
          <Text style={styles.bio}>Less perfection, more authenticity. ✨</Text>
          
         
        </View>

        {/* Action Buttons, Stats, Grid... */}
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

// Styles
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
  imageContainer: { position: "relative" },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  editProfileBtn: {
    backgroundColor: "#318CE7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 15,
  },
  userName: { fontSize: 22, fontWeight: "800", marginTop: 15 },
  userHandle: {
    fontSize: 15,
    color: "#318CE7",
    fontWeight: "600",
    marginTop: 5,
  },
  bio: {
    textAlign: "center",
    color: "#7D8699",
    marginTop: 10,
    paddingHorizontal: 40,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 15,
  },
  followBtn: {
    backgroundColor: "#318CE7",
    paddingHorizontal: 45,
    paddingVertical: 15,
    borderRadius: 30,
    flex: 1,
    maxWidth: 160,
    alignItems: "center",
  },
  followText: { color: "#fff", fontWeight: "700" },
  messageBtn: {
    backgroundColor: "#E8F3FF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    flex: 1,
    maxWidth: 160,
    alignItems: "center",
  },
  messageText: { color: "#318CE7", fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    gap: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    width: width / 2 - 40,
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#318CE7" },
  statLabel: { fontSize: 12, color: "#7D8699", fontWeight: "600" },
  photosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginTop: 40,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  viewAll: { color: "#318CE7", fontWeight: "600" },
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
