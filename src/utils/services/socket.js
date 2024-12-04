import { Server as SocketServer } from "socket.io";
import File from "../../models/file.js";
import runDocker from "./docker.js";

let io = null;
let socketInstance = null;

const socketInit = (server) => {
  io = new SocketServer(server, {
    cors: { origin: process.env.REACT_APP_URL },
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socketInstance = socket;

    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    socket.on("update-file", async ({ fileId, content }) => {
      const file = await File.findOne({ _id: fileId });
      if (!file) {
        return socket.emit("file-error", { error: "File not found" });
      }

      file.content = content;
      await file.save();
    });

    socket.on("execute-code", ({ language, content }) => {
      runDocker({ socket, language, content });
    });

    socket.on("disconnect", () => {
      console.log("disconnect user", userId);
    });
  });
};

const getIoInstance = () => io;
const getSocketInstance = () => socketInstance;

export { socketInit, getIoInstance, getSocketInstance };
