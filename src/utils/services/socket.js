import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
import File from "../../models/file.js";
import User from "../../models/user.js";
import executeCode from "./code-execute.js";

dotenv.config();

let io;
let socketInstance;

const onlineUsers = new Map();

const socketInit = (server) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.REACT_APP_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socketInstance = socket;

    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
    }

    socket.on("file-open", async ({ fileId }) => {
      socket.join(fileId);

      const user = await User.findOne({ _id: userId });
      if (user) {
        return socket.to(fileId).emit("new-user-joined", {
          result: `${user.name} has joined`,
        });
      }
    });

    socket.on("file-close", async ({ fileId }) => {
      const user = await User.findOne({ _id: userId });
      if (user) {
        socket.to(fileId).emit("user-left", {
          result: `${user.name} has left`,
        });
      }
      return socket.leave(fileId);
    });

    socket.on("update-file", async ({ fileId, content }) => {
      const file = await File.findOne({ _id: fileId });
      if (!file) {
        return socket.emit("file-error", { result: "File not found" });
      }

      file.content = content;
      await file.save();

      // real-time update code for active collaborators
      return socket.to(fileId).emit("file-updated", { id: file._id, content });
    });

    socket.on("execute-code", ({ language, content }) => {
      executeCode({ socket, language, content });
    });

    socket.on("disconnect", () => {
      // Remove the user from onlineUsers map when they disconnect
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
};

const getIoInstance = () => io;
const getSocketInstance = () => socketInstance;

export { socketInit, getIoInstance, getSocketInstance, onlineUsers };
