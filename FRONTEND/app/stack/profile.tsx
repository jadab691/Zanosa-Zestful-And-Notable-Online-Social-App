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

import { BASE_URL } from "../../config/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("Example User");
  const [posts, setPosts] = useState<any[]>([]);

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        if (storedName) setName(storedName);

        const token = await AsyncStorage.getItem("token");
        if (!token) return;

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
            uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=60",
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
});
