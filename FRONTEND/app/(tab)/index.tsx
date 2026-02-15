import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

const Home = () => {
  const handlePost = () => alert("Post button clicked");
  const handleLike = () => alert("You liked this!");
  const handleComment = () => alert("Comment clicked!");

  const renderPost = () => (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
          }}
          style={styles.profileImage}
        />

        <Link href="/stack/userprofile">
          <Text style={styles.username}>Zefry Epstin</Text>
        </Link>
      </View>

      {/* Post Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.postImage}
      />

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text>@Caption for the post</Text>
      </View>

      {/* Like & Comment */}
      <View style={styles.actionRow}>
        <Pressable onPress={handleLike} style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="red" />
          <Text style={styles.actionText}>Like</Text>
        </Pressable>

        <Pressable onPress={handleComment} style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="blue" />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>
      </View>
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
        {renderPost()}
        {renderPost()}
        {renderPost()}
        {renderPost()}
        {renderPost()}
        {renderPost()}
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
    height: 200,
  },

  captionContainer: {
    padding: 10,
    height: 100,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    marginLeft: 5,
  },
});
