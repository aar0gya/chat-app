// backend/src/lib/socket.js
import { Server } from "socket.io";
import http from "http";

// used to store online users
const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export const initSocket = (app) => {
  // create HTTP server using the express app
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return { io, server };
};
