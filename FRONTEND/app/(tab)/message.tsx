import { View, Text, ScrollView, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";

const Message = () => {
  const renderChatItem = () => (
    <Link href={"/stack/inbox"} style={styles.chatItem}>
      <View>
        <Text style={styles.chatName}>John Doe</Text>
        <Text style={styles.chatText}>Hey! How are you?</Text>
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* Message Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Messages</Text>
      </View>

      {/* Chat List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.noMessageText}>
          No messages yet. Start a conversation!
        </Text> */}

        {renderChatItem()}
        {renderChatItem()}
        {renderChatItem()}
        {renderChatItem()}
        {renderChatItem()}
        {renderChatItem()}
        {renderChatItem()}
        {renderChatItem()}
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
