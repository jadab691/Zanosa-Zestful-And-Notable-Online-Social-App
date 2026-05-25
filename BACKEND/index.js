import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

connectDB();

const PORT = process.env.PORT || 5500;

const server = createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
