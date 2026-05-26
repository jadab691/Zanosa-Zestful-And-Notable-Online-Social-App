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
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const name = Array.isArray(params.name) ? params.name[0] : params.name;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const paramsProfilePic = Array.isArray(params.profilePic) ? params.profilePic[0] : params.profilePic;
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [modalListType, setModalListType] = useState<"followers" | "following">("followers");
  const [modalListData, setModalListData] = useState<any[]>([]);

  const fetchFollowList = async (type: "followers" | "following") => {
    if (!id) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/auth/users/${id}/${type}`, {
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
            uri: post.user?.profilePic || paramsProfilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
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
    const fetchData = async () => {
      if (!id) return;
      try {
        const token = await AsyncStorage.getItem("token");
        
        // Fetch posts
        const postsRes = await fetch(`${BASE_URL}/api/posts/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = await postsRes.json();
        if (Array.isArray(postsData)) setPosts(postsData);

        // Fetch target user details
        const targetRes = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const targetData = await targetRes.json();
        if (targetRes.ok) {
          setFollowersCount(targetData.followers?.length || 0);
          setFollowingCount(targetData.following?.length || 0);
        }

        // Fetch current user to check if following
        const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          if (profileData._id) setCurrentUserId(profileData._id);
          const isFollowing = profileData.following?.includes(id);
          setFollowing(!!isFollowing);
        }

      } catch (err) {
        console.log("Error fetching user data:", err);
      }
    };
    fetchData();
  }, [id]);

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/auth/users/${id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        setFollowersCount((prev) => data.following ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.log("Error following user", error);
    }
  };

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
          source={{ uri: posts[0]?.user?.profilePic || paramsProfilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80" }}
          style={styles.avatar}
        />
 
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
          onPress={toggleFollow}
        >
          <Text style={[{ fontWeight: "600" }, following && { color: "#000" }, !following && { color: "#fff" }]}>
            {following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={() =>
            router.push({
              pathname: "/stack/inbox",
              params: { chatPartnerEmail: email, chatPartnerName: name },
            })
          }
        >
          <Text style={{ fontWeight: "600" }}>Message</Text>
        </TouchableOpacity>
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
                  if (user._id === currentUserId) {
                    router.push("/stack/profile");
                  } else if (user._id !== id) {
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
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
  },
});
