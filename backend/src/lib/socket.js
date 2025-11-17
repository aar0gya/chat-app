// backend/src/lib/socket.js
import { Server } from "socket.io";
import http from "http";

const userSocketMap = {};
let ioInstance = null;

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export const getIO = () => ioInstance;

export const initSocket = (app) => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  ioInstance = io; // store globally so controllers can access it

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
