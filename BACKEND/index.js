import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import Message from "./models/message.js";

connectDB();

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins
  }
});

const connectedUsers = {};

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
        text: msgData.text,
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
