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
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

const SOCKET_SERVER_URL = `${BASE_URL}`;

interface Message {
  senderEmail: string;
  receiverEmail: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

const Inbox = () => {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const chatPartnerEmail = Array.isArray(params.chatPartnerEmail)
    ? params.chatPartnerEmail[0]
    : (params.chatPartnerEmail as string) ?? "";
  const chatPartnerName = Array.isArray(params.chatPartnerName)
    ? params.chatPartnerName[0]
    : (params.chatPartnerName as string) ?? "Chat";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const userEmailRef = useRef<string>("");
  const chatPartnerEmailRef = useRef<string>(chatPartnerEmail);
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    chatPartnerEmailRef.current = chatPartnerEmail;
  }, [chatPartnerEmail]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    AsyncStorage.getItem("userEmail").then((email) => {
      if (!email) return;
      userEmailRef.current = email;
      setUserEmail(email);

      socket.emit("register", email);
      socket.emit("get_messages", {
        userEmail: email,
        chatPartnerEmail: chatPartnerEmailRef.current,
      });
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

    if (!input.trim() || !receiver || !sender) return;

    const msg: Message = {
      senderEmail: sender,
      receiverEmail: receiver,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    socketRef.current?.emit("message", msg);
    setInput("");
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    setUploadingImage(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      if (Platform.OS === "web") {
        // For web, fetch the blob
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formData.append("image", blob, "chat_image.jpg");
      } else {
        formData.append("image", {
          uri: asset.uri,
          name: "chat_image.jpg",
          type: "image/jpeg",
        } as any);
      }

      const uploadRes = await fetch(`${BASE_URL}/api/posts/upload-chat-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { imageUrl } = await uploadRes.json();

      // Send image message via socket
      const sender = userEmailRef.current;
      const receiver = chatPartnerEmailRef.current;

      const msg: Message = {
        senderEmail: sender,
        receiverEmail: receiver,
        text: "",
        imageUrl,
        timestamp: new Date().toLocaleTimeString(),
      };

      socketRef.current?.emit("message", msg);
    } catch (err) {
      console.log("Image upload error:", err);
      alert("Failed to send image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={5}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.headerText, { color: colors.text }]}>{chatPartnerName || "Chat"}</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => {
              const isMe = msg.senderEmail === userEmail;
              return (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : [styles.theirMessage, { backgroundColor: colors.card, borderColor: colors.border }],
                  ]}
                >
                  {msg.imageUrl ? (
                    <Image
                      source={{ uri: msg.imageUrl }}
                      style={styles.chatImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  {msg.text ? (
                    <Text
                      style={[
                        styles.messageText,
                        !isMe && { color: colors.text },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  ) : null}
                  <Text style={[styles.timestamp, isMe ? { color: "rgba(255,255,255,0.6)" } : { color: colors.text, opacity: 0.5 }]}>
                    {msg.timestamp}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Uploading indicator */}
          {uploadingImage && (
            <View style={[styles.uploadingBanner, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.uploadingText, { color: colors.text }]}>Sending image...</Text>
            </View>
          )}

          {/* Input Box */}
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity onPress={handlePickImage} style={styles.imagePickerButton} disabled={uploadingImage}>
              <Ionicons name="image-outline" size={26} color={uploadingImage ? "gray" : colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.text + "88"}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
  },

  header: {
    padding: 15,
    borderBottomWidth: 1,
    marginBottom: 5,
  },

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  messageBubble: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "78%",
  },

  myMessage: {
    backgroundColor: "#5868f5",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },

  theirMessage: {
    borderWidth: 1,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    color: "#fff",
  },

  chatImage: {
    width: 220,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
  },

  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  uploadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 15,
    gap: 10,
  },

  uploadingText: {
    fontSize: 14,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  imagePickerButton: {
    paddingRight: 8,
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
