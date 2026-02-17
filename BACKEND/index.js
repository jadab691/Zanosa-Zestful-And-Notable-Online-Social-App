// app.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 3000;

const app = express();
app.use(cors()); // Allow all origins for development
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow any frontend
    methods: ["GET", "POST"],
  },
});

// Test route
app.get("/", (req, res) => {
  res.send("Chat server running 🚀");
});

// Store messages (simple memory storage for testing)
let messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send all previous messages to new user
  socket.emit("all_messages", messages);

  // Receive message from client
  socket.on("message", (data) => {
    console.log("Message received:", data);
    messages.push(data); // store message
    io.emit("message", data); // broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Listen on all interfaces
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
