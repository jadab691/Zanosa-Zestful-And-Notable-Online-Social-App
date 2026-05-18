import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const { width } = Dimensions.get("window");

const Userprofile = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [following, setFollowing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

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
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/150?img=12",
          }}
          style={styles.profileAvatar}
        />
        <Text style={styles.postUsername}>{post.user?.name || name}</Text>
      </View>

      <Image source={{ uri: post.image }} style={styles.fullPostImage} />

      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>
          <Text style={styles.usernameBold}>{post.user?.name || name}</Text> {post.caption}
        </Text>
      </View>

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

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!id) return;
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/posts/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      } catch (err) {
        console.log("Error fetching user posts:", err);
      }
    };
    fetchUserPosts();
  }, [id]);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=12" }}
          style={styles.avatar}
        />
 
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
 
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Name & Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.name}>{name || "User"}</Text>
        <Text style={styles.bio}>
          📸 Photographer 🌍 Traveler 🎨 Creative Mind
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.followButton,
            following && { backgroundColor: "#ddd" },
          ]}
          onPress={() => setFollowing(!following)}
        >
          <Text style={{ fontWeight: "600" }}>
            {following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>

        <View style={styles.messageButton}>
          <Link href={"/stack/inbox"}>
            <Text style={{ fontWeight: "600" }}>Message</Text>
          </Link>
        </View>
      </View>

      {/* Posts Grid */}
      <View style={styles.grid}>
        {posts.map((post, index) => (
          <TouchableOpacity key={post._id || index} onPress={() => setSelectedPost(post)} style={styles.postContainer}>
            <Image source={{ uri: post.image }} style={styles.gridImage} />
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
    </>
  );
};

export default Userprofile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
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

  bioSection: {
    marginTop: 15,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  bio: {
    marginTop: 5,
    fontSize: 14,
    color: "#444",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },

  followButton: {
    flex: 1,
    backgroundColor: "#1DA1F2",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  messageButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
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
    aspectRatio: 1,
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
