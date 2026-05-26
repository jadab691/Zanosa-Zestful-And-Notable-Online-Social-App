import { Server } from "socket.io";
import Message from "./models/message.js";

let io;
const connectedUsers = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // * means allow all device to connect . 
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // User registers their email to link with socket ID
    socket.on("register", (email) => {
      connectedUsers[email] = socket.id;
      console.log(`${email} registered with socket ${socket.id}`);
    });

    // Get messages between logged-in user and a specific partner
    socket.on("get_messages", async ({ userEmail, chatPartnerEmail }) => {
      try {
        const messages = await Message.find({
          $or: [
            { senderEmail: userEmail, receiverEmail: chatPartnerEmail },
            { senderEmail: chatPartnerEmail, receiverEmail: userEmail }
          ]
        }).sort({ _id: 1 });
        socket.emit("all_messages", messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });

    // Listen for new messages
    socket.on("message", async (msgData) => {
      try {
        console.log("📨 Received message data:", JSON.stringify(msgData));
        // Save message to DB
        const newMessage = new Message({
          senderEmail: msgData.senderEmail,
          receiverEmail: msgData.receiverEmail,
          text: msgData.text || "",
          imageUrl: msgData.imageUrl || "",
          timestamp: msgData.timestamp,
        });
        await newMessage.save();

        // Emit to receiver if online
        const receiverSocketId = connectedUsers[msgData.receiverEmail];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message", newMessage);
        }
        
        // Also emit back to sender
        socket.emit("message", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      for (const [email, id] of Object.entries(connectedUsers)) {
        if (id === socket.id) delete connectedUsers[email];
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
