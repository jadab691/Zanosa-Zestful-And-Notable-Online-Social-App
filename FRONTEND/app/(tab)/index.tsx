import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const Home = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [myEmail, setMyEmail] = useState<string>("");

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.log("Error fetching feed:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Load logged-in user's email
    AsyncStorage.getItem("userEmail").then((email) => {
      if (email) setMyEmail(email);
    });
  }, []);

  const handleUsernamePress = (post: any) => {
    if (post.user?.email && post.user.email === myEmail) {
      // It's the logged-in user's own post → go to own profile tab
      router.push("/stack/profile");
    } else {
      // Another user → go to their profile
      router.push({
        pathname: "/stack/userprofile",
        params: { id: post.user?._id, name: post.user?.name, email: post.user?.email, profilePic: post.user?.profilePic },
      });
    }
  };

  const handlePost = () => router.push("/stack/post");
  
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
        setCommentText("");
        setActiveCommentPostId(null);
      } else {
        Alert.alert("Error", "Could not add comment");
      }
    } catch (err) {
      console.log("Error adding comment:", err);
    }
  };

  const renderPost = (post: any) => (
    <View key={post._id} style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: post.user?.profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
          }}
          style={styles.profileImage}
        />

        <Pressable onPress={() => handleUsernamePress(post)}>
            <Text style={styles.username}>{post.user?.name || "Unknown User"}</Text>
          </Pressable>
      </View>

      {/* Post Image */}
      <Image
        source={{
          uri: post.image,
        }}
        style={styles.postImage}
      />

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>
          <Text style={styles.usernameBold}>{post.user?.name}</Text> {post.caption}
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

      {/* Like & Comment */}
      <View style={styles.actionRow}>
        <Pressable onPress={() => handleLike(post._id)} style={styles.actionButton}>
          <Ionicons name={post.likes && post.likes.length > 0 ? "heart" : "heart-outline"} size={24} color={post.likes && post.likes.length > 0 ? "red" : "black"} />
          <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
        </Pressable>

        <Pressable onPress={() => handleComment(post._id)} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="black" />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </Pressable>
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
          <Pressable onPress={() => submitComment(post._id)}>
            <Text style={styles.submitCommentText}>Post</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Zanosa</Text>

        <Pressable onPress={handlePost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>

      {/* Feed */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.map(renderPost)}
      </ScrollView>
    </View>
  );
};

export default Home;


// style 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  postButton: {
    height: 40,
    width: 80,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5868f5",
  },

  postButtonText: {
    fontWeight: "600",
    color: "white",
    fontSize: 17,
  },

  postContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 20,
    overflow: "hidden",
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  username: {
    fontSize: 16,
    fontWeight: "500",
  },

  postImage: {
    width: "100%",
    height: 350,
  },

  captionContainer: {
    padding: 10,
    minHeight: 40,
  },

  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
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
  
  captionText: {
    fontSize: 14,
    color: "#333",
  },
  
  usernameBold: {
    fontWeight: "bold",
    color: "#000",
  },
  
  commentsList: {
    paddingHorizontal: 10,
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
  
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
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
