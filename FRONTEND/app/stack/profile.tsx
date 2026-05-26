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
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { BASE_URL } from "../../config/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("Example User");
  const [posts, setPosts] = useState<any[]>([]);
  const [profilePic, setProfilePic] = useState<string>("");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userId, setUserId] = useState<string>("");

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [modalListType, setModalListType] = useState<"followers" | "following">("followers");
  const [modalListData, setModalListData] = useState<any[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        if (storedName) setName(storedName);

        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        // Fetch user profile to get profilePic
        const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData._id) setUserId(profileData._id);
          if (profileData.name) setName(profileData.name);
          if (profileData.profilePic) setProfilePic(profileData.profilePic);
          setFollowersCount(profileData.followers?.length || 0);
          setFollowingCount(profileData.following?.length || 0);
        }

        // Fetch user posts
        const res = await fetch(`${BASE_URL}/api/posts/my-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postData = await res.json();
        if (Array.isArray(postData)) {
          setPosts(postData);
        }
      } catch (err) {
        console.log("Error loading profile:", err);
      }
    };

    loadProfile();
  }, []);

  const fetchFollowList = async (type: "followers" | "following") => {
    if (!userId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/auth/users/${userId}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setModalListData(data);
        setModalListType(type);
        setIsListModalVisible(true);
      } else {
        Alert.alert("Error", `Could not fetch ${type}`);
      }
    } catch (err) {
      console.log(`Error fetching ${type}:`, err);
    }
  };

  const changeProfilePic = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow gallery access to upload a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Please login again");
        return;
      }

      const formData = new FormData();
      let filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      if (!match) {
        filename = `${filename}.jpg`;
      }

      if (Platform.OS === "web") {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        formData.append("image", blob, filename);
      } else {
        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${BASE_URL}/api/auth/profile-pic`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Upload failed");
      }

      setProfilePic(resData.profilePic);
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (err: any) {
      console.log("Error changing profile picture:", err.message);
      Alert.alert("Upload failed", err.message || "Could not upload profile picture.");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
        if (selectedPost?._id === postId) {
          setSelectedPost(updatedPost);
        }
      }
    } catch (err) {
      console.log("Error liking post:", err);
    }
  };

  const handleComment = (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      setCommentText("");
    }
  };

  const submitComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
        if (selectedPost?._id === postId) {
          setSelectedPost(updatedPost);
        }
        setCommentText("");
        setActiveCommentPostId(null);
      } else {
        Alert.alert("Error", "Could not add comment");
      }
    } catch (err) {
      console.log("Error adding comment:", err);
    }
  };

  const renderFullPost = (post: any) => (
    <View key={post._id} style={styles.fullPostContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
          }}
          style={styles.profileAvatar}
        />
        <Text style={styles.postUsername}>{post.user?.name || name}</Text>
      </View>

      {/* Post Image */}
      <Image
        source={{
          uri: post.image,
        }}
        style={styles.fullPostImage}
      />

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>
          <Text style={styles.usernameBold}>{post.user?.name || name}</Text> {post.caption}
        </Text>
      </View>

      {/* Render Comments */}
      {post.comments && post.comments.length > 0 && (
        <View style={styles.commentsList}>
          {post.comments.slice(-2).map((c: any, index: number) => (
            <Text key={index} style={styles.commentText}>
              <Text style={styles.usernameBold}>{c.user?.name}</Text> {c.text}
            </Text>
          ))}
          {post.comments.length > 2 && <Text style={styles.viewAllText}>View all {post.comments.length} comments</Text>}
        </View>
      )}

      {/* Like & Comment Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => handleLike(post._id)} style={styles.actionButton}>
          <Ionicons name={post.likes && post.likes.length > 0 ? "heart" : "heart-outline"} size={24} color={post.likes && post.likes.length > 0 ? "red" : "black"} />
          <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleComment(post._id)} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="black" />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Input Box */}
      {activeCommentPostId === post._id && (
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity onPress={() => submitComment(post._id)}>
            <Text style={styles.submitCommentText}>Post</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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
          <TouchableOpacity onPress={changeProfilePic} activeOpacity={0.8} style={{ position: "relative" }}>
            <Image
              source={{
                uri: profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
              }}
              style={styles.profileImage}
            />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.bio}>Less perfection, more authenticity. ✨</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <TouchableOpacity style={styles.statBox} onPress={() => fetchFollowList("followers")}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={() => fetchFollowList("following")}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          {posts.map((post, index) => (
            <TouchableOpacity key={post._id || index} onPress={() => setSelectedPost(post)} style={styles.postContainer}>
              <Image
                source={{ uri: post.image }}
                style={styles.gridImage}
              />
              {post.caption ? (
                <Text style={styles.caption} numberOfLines={2}>
                  {post.caption}
                </Text>
              ) : null}
              <View style={styles.gridActionRow}>
                 <Ionicons name={post.likes && post.likes.length > 0 ? "heart" : "heart-outline"} size={14} color={post.likes && post.likes.length > 0 ? "red" : "black"} />
                 <Text style={styles.gridActionText}>{post.likes?.length || 0}</Text>
                 <View style={{width: 10}} />
                 <Ionicons name="chatbubble-outline" size={14} color="black" />
                 <Text style={styles.gridActionText}>{post.comments?.length || 0}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!selectedPost} animationType="slide" onRequestClose={() => setSelectedPost(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPost(null)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Post</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedPost && renderFullPost(selectedPost)}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={isListModalVisible} animationType="slide" onRequestClose={() => setIsListModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsListModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalListType === "followers" ? "Followers" : "Following"}
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {modalListData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="gray" />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              modalListData.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  style={styles.userItem}
                  onPress={() => {
                    setIsListModalVisible(false);
                    if (user._id !== userId) {
                      router.push({
                        pathname: "/stack/userprofile",
                        params: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
                      });
                    }
                  }}
                >
                  <Image
                    source={{
                      uri: user.profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
                    }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userItemName}>{user.name}</Text>
                    <Text style={styles.userItemEmail}>{user.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="lightgray" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
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
  editBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#1DA1F2",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
    color: "gray",
  },
  grid: {
    paddingTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    justifyContent: "space-between",
  },
  postContainer: {
    width: "31%",
    marginBottom: 15,
  },
  gridImage: {
    width: "100%",
    aspectRatio: 1, // Make it a square thumbnail
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  caption: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
  gridActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  gridActionText: {
    fontSize: 12,
    marginLeft: 3,
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF2",
  },
  closeButton: { padding: 5 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  fullPostContainer: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: "600",
  },
  fullPostImage: {
    width: "100%",
    height: 350,
  },
  captionContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  captionText: {
    fontSize: 14,
    color: "#333",
  },
  usernameBold: {
    fontWeight: "bold",
    color: "#000",
  },
  commentsList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  commentText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    fontWeight: "500",
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  submitCommentText: {
    color: "#318CE7",
    fontWeight: "600",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 15,
    backgroundColor: "#E4E6EB",
  },
  userInfo: {
    flex: 1,
  },
  userItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  userItemEmail: {
    fontSize: 13,
    color: "#65676B",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
  },
});
