import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { colors } = useTheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Show popup if user is not logged in and auth check is finished
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     Alert.alert(
  //       "You're not logged in",
  //       "Please log in to see posts and interact with the community.",
  //       [
  //         {
  //           text: "Login",
  //           onPress: () => router.push("/stack/login"),
  //           style: "default",
  //         },
  //         {
  //           text: "Sign Up",
  //           onPress: () => router.push("/stack/signup"),
  //           style: "cancel",
  //         },
  //       ]
  //     );

  //   }
  // }

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/stack/signup");
    }
  }, [isLoading, user]);
  const [posts, setPosts] = useState<any[]>([]);
  const [myEmail, setMyEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

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
    // Load logged-in user's email & profile ID
    AsyncStorage.getItem("userEmail").then((email) => {
      if (email) setMyEmail(email);
    });
    AsyncStorage.getItem("token").then(async (token) => {
      if (!token) return;
      try {
        const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData._id) setUserId(profileData._id);
        }
      } catch (err) {
        console.log("Error loading profile ID:", err);
      }
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleUserProfileNav = (targetUser: any) => {
    if (!targetUser) return;
    if (targetUser.email && targetUser.email === myEmail) {
      // It's the logged-in user's own profile
      router.push("/stack/profile");
    } else {
      // Another user → go to their profile
      router.push({
        pathname: "/stack/userprofile",
        params: { id: targetUser._id, name: targetUser.name, email: targetUser.email, profilePic: targetUser.profilePic },
      });
    }
  };

  const handleUsernamePress = (post: any) => {
    handleUserProfileNav(post.user);
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
    <View key={post._id} style={[styles.postContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: post.user?.profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
          }}
          style={styles.profileImage}
        />

        <Pressable onPress={() => handleUsernamePress(post)}>
          <Text style={[styles.username, { color: colors.text }]}>{post.user?.name || "Unknown User"}</Text>
        </Pressable>
      </View>


      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={[styles.captionText, { color: colors.text }]}>
          {post.caption}
        </Text>
      </View>

      {/* Post Image */}
      <Image
        source={{
          uri: post.image,
        }}
        style={styles.postImage}
      />



      {/* Render Comments */}
      {post.comments && post.comments.length > 0 && (
        <View style={styles.commentsList}>
          {(expandedComments[post._id] ? post.comments : post.comments.slice(-2)).map((c: any, index: number) => (
            <Text key={index} style={[styles.commentText]}>
              <Text
                style={[styles.usernameBold]}
                onPress={() => handleUserProfileNav(c.user)}
              >
                {c.user?.name || "Unknown"}
              </Text>{" "}
              {c.text}
            </Text>
          ))}
          {post.comments.length > 2 && (
            <Pressable onPress={() => toggleComments(post._id)}>
              <Text style={styles.viewAllText}>
                {expandedComments[post._id] ? "Hide comments" : `View all ${post.comments.length} comments`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Like & Comment */}
      <View style={styles.actionRow}>
        <Pressable onPress={() => handleLike(post._id)} style={styles.actionButton}>
          <Ionicons
            name={post.likes && post.likes.includes(userId) ? "heart" : "heart-outline"}
            size={24}
            color={post.likes && post.likes.includes(userId) ? "red" : colors.text}
          />
          <Text style={[styles.actionText, { color: colors.text }]}>{post.likes?.length || 0}</Text>
        </Pressable>

        <Pressable onPress={() => handleComment(post._id)} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>{post.comments?.length || 0}</Text>
        </Pressable>
      </View>

      {/* Comment Input Box */}
      {activeCommentPostId === post._id && (
        <View style={styles.commentInputRow}>
          <TextInput
            style={[styles.commentInput]}
            placeholder="criticize or praise ..."
            placeholderTextColor={colors.text}
            value={commentText}
            onChangeText={setCommentText}
          />
          <Pressable onPress={() => submitComment(post._id)}>
            <Text style={styles.submitCommentText}>Tell</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* <Text style={[styles.appTitle, { color: colors.text }]}>Zanosa</Text> */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#faffe6ff",

            textShadowColor: "rgba(74, 0, 247, 0.8)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 12,

            letterSpacing: 5,
          }}
        >
          ZANOSA
        </Text>

        <Pressable onPress={handlePost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>

      {/* Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
    paddingTop: 30,
    paddingHorizontal: 5,
    backgroundColor: "#ffffffff",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  appTitle: {
    fontSize: 30,
    fontWeight: "bold",
    fontStyle: "italic"
  },

  postButton: {
    height: 40,
    width: 80,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#48298aff",
  },

  postButtonText: {
    fontWeight: "600",
    color: "#ffffffff",
    fontSize: 14,
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
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
  },

  username: {
    fontSize: 12,
    fontWeight: "500",
  },

  postImage: {
    width: "100%",
    height: 350,
    resizeMode: "contain",
  },

  captionContainer: {
    padding: 10,
    minHeight: 60,
  },



  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 5,
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
    color: "#312d2dff",
  },

  usernameBold: {
    fontWeight: "bold",
    color: "#7e83ffff",
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
