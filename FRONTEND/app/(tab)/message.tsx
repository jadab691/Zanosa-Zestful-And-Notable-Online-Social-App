import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/api";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const Message = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${BASE_URL}/api/auth/chatted-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const renderChatItem = (user: any) => (
    <TouchableOpacity
      key={user._id}
      style={[styles.chatItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() =>
        router.push({
          pathname: "/stack/inbox",
          params: {
            chatPartnerName: user.name,
            chatPartnerEmail: user.email,
            chatPartnerProfilePic: user.profilePic
          },
        })
      }
    >
      <Image
        source={{
          uri: user.profilePic || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80",
        }}
        style={styles.avatar}
      />
      <Text style={[styles.chatName, { color: colors.text }]}>{user.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Message Header */}
      <View style={[{ paddingTop: 20, paddingBottom: 20, borderColor: "white", borderWidth: 1, margin: 0 }]}>
        <Text style={[{ fontSize: 24, fontWeight: "bold", textAlign: "center", alignItems: "center", color: "#27e86eff", margin: 15 ,
          
        }]}
        >Messages
        </Text>
        <Text style={[{ fontSize: 12, textAlign: "center", alignItems: "center", color: "#333433ff", marginTop: 10 }]}
        >Send messages to friends and start Backbiting
        </Text>
      </View>

      {/* Chat List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {users.length === 0 ? (
          <Text style={styles.noMessageText}>No messages found. Go make some friends!</Text>
        ) : (
          users.map(renderChatItem)
        )}
      </ScrollView>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: "#27e86eff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },

  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  noMessageText: {
    fontSize: 18,
    color: "gray",
    marginBottom: 20,
  },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 70,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
  },

  chatName: {
    fontSize: 16,
    fontWeight: "500",
  },

  chatText: {
    marginLeft: 10,
    color: "gray",
  },
});
