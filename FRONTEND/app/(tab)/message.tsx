import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/api";
import axios from "axios";

const Message = () => {
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
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
    fetchUsers();
  }, []);

  const renderChatItem = (user: any) => (
    <TouchableOpacity
      key={user._id}
      style={styles.chatItem}
      onPress={() =>
        router.push({
          pathname: "/stack/inbox",
          params: { chatPartnerEmail: user.email, chatPartnerName: user.name },
        })
      }
    >
      <Text style={styles.chatName}>{user.name}</Text>
      <Text style={styles.chatText}>{user.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Message Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Messages</Text>
      </View>

      {/* Chat List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {users.length === 0 ? (
          <Text style={styles.noMessageText}>No users found. Go make some friends!</Text>
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
    backgroundColor: "#f0f0f0",
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
    alignItems: "flex-start",
    height: 80,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 20,
    borderColor: "#ddd",
    borderWidth: 1,
    justifyContent: "center",
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
