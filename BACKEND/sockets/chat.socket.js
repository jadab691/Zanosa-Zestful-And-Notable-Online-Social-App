// sockets/chat.socket.js

export const initSocket = (io) => {
  // Store messages
  let messages = [];

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send all previous messages to new user
    socket.emit("all_messages", messages);

    // Receive message from client
    socket.on("message", (data) => {
      console.log("Message received:", data);
      messages.push(data);
      io.emit("message", data); // broadcast to all clients
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
