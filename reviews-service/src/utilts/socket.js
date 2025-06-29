import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});
const userSocketMap = {};

export function getReceiverSocketId(userId) {

  return userSocketMap.id =[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    console.log(userId, "recived from socket");
    
    userSocketMap[userId] = socket.id;
    console.log("User connected with ID:", userId, "Socket ID:", socket.id);
  }

  console.log("Current userSocketMap:", userSocketMap);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log("User disconnected with ID:", userId, "Socket ID:", socket.id);
    }
    console.log("Current userSocketMap:", userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
