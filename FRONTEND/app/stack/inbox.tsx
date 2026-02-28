// Inbox.tsx
import BASE_URL from "@/config/api";
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

// Replace with your PC IP for testing on phone
const SOCKET_SERVER_URL = `${BASE_URL}`;

interface Message {
  id: string;
  text: string;
  timestamp: string;
}

const Inbox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to backend
    socketRef.current = io(SOCKET_SERVER_URL);

    // Receive all previous messages
    socketRef.current.on("all_messages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    // Listen for new messages
    socketRef.current.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const msg: Message = {
      id: socketRef.current?.id || "",
      text: input,
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
            <Text style={styles.headerText}>Zefry Epstine.</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => {
              const isMe = msg.id === socketRef.current?.id;
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
