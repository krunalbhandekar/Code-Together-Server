import { Server } from "http";
import { Socket, Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;
let socketInstance: Socket | null = null;

const socketInit = (server: Server) => {
  io = new SocketServer(server, {
    cors: { origin: process.env.REACT_APP_URL },
  });

  io.on("connection", (socket) => {
    socketInstance = socket;

    socket.on("disconnect", () => {
      console.log("disconnect user");
    });
  });
};

const getIoInstance = () => io;
const getSocketInstance = () => socketInstance;

export { socketInit, getIoInstance, getSocketInstance };
