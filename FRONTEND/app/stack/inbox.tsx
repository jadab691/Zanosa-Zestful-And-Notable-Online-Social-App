import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/api";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";

// Replace with your PC IP for testing on phone
const SOCKET_SERVER_URL = `${BASE_URL}`;

interface Message {
  senderEmail: string;
  receiverEmail: string;
  text: string;
  timestamp: string;
}

const Inbox = () => {
  const params = useLocalSearchParams();
  // Force to string (useLocalSearchParams can return string | string[])
  const chatPartnerEmail = Array.isArray(params.chatPartnerEmail)
    ? params.chatPartnerEmail[0]
    : (params.chatPartnerEmail as string) ?? "";
  const chatPartnerName = Array.isArray(params.chatPartnerName)
    ? params.chatPartnerName[0]
    : (params.chatPartnerName as string) ?? "Chat";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Refs so socket callbacks always access the latest values
  const userEmailRef = useRef<string>("");
  const chatPartnerEmailRef = useRef<string>(chatPartnerEmail);
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  // Keep chatPartnerEmailRef in sync
  useEffect(() => {
    chatPartnerEmailRef.current = chatPartnerEmail;
  }, [chatPartnerEmail]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    // Fetch user email FIRST, then register and load messages
    AsyncStorage.getItem("userEmail").then((email) => {
      if (!email) return;
      userEmailRef.current = email;
      setUserEmail(email);

      socket.emit("register", email);
      socket.emit("get_messages", {
        userEmail: email,
        chatPartnerEmail: chatPartnerEmailRef.current,
      });

      console.log("✅ Registered:", email, "→ chatting with:", chatPartnerEmailRef.current);
    });

    socket.on("all_messages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatPartnerEmail]);

  const handleSend = () => {
    const sender = userEmailRef.current;
    const receiver = chatPartnerEmailRef.current;

    console.log("📤 handleSend — sender:", sender, "receiver:", receiver, "text:", input.trim());

    if (!input.trim() || !receiver || !sender) {
      console.warn("❌ Blocked send — missing field");
      return;
    }

    const msg: Message = {
      senderEmail: sender,
      receiverEmail: receiver,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    socketRef.current?.emit("message", msg);
    setInput("");
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={5}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{chatPartnerName || "Chat"}</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => {
              const isMe = msg.senderEmail === userEmail;
              return (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.theirMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      !isMe && styles.theirMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  
                </View>
              );
            })}
          </ScrollView>

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
            />
            <Pressable style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Inbox;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },

  header: {
    backgroundColor: "#d4d9ea",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3d3d",
    textAlign: "center",
  },

  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },

  myMessage: {
    backgroundColor: "#5868f5",
    alignSelf: "flex-end",
  },

  theirMessage: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "flex-start",
  },
  theirMessageText: {
    color: "#333",
  },
  messageText: {
    fontSize: 16,
    color: "#e5dddd",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e7dfdf",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#5868f5",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
