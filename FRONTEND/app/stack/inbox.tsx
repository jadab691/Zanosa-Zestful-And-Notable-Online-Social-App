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

const Inbox = () => {
  const [messages, setMessages] = useState([
    { sender: "John Doe", text: "Hey! How are you?" },
    { sender: "Me", text: "I'm good, thanks! How about you?" },
    { sender: "John Doe", text: "Doing great. What are you up to?" },
    { sender: "Me", text: "Just working on a project." },
    { sender: "John Doe", text: "Cool! Keep it up." },
  ]);

  const [input, setInput] = useState(""); // store text input
  const scrollViewRef = useRef<ScrollView>(null); // scroll reference

  // Send a message
  const handleSend = () => {
    if (input.trim() === "") return; // ignore empty messages
    setMessages([...messages, { sender: "Me", text: input }]); // add message
    setInput(""); // clear input
  };

  // Scroll to the latest message automatically
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={5} // adjust if needed
    >
      {/* Tap outside to close keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Jefry Epstine</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom: 100 }} // leave space for input
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.sender === "Me" ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender !== "Me" && styles.theirMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
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

// Simple beginner-friendly styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom:20,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },

  header: {
    backgroundColor: "#b1bff3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3d3d",
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

  messageText: {
    fontSize: 16,
    color: "#fff",
  },

  theirMessageText: {
    color: "#000",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
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
