import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { appConfig } from "./config/app-config";
const port = appConfig.PORT || 8080;

const app = express();
app.use(
  cors({
    allowedHeaders: ["*"],
    origin: ["*"],
  })
);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/wc",
});

io.on("connection", (socket) => {
  console.log({ "A new user has connected": socket.id });

  // Join room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  // Leave a room
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`user ${socket.id} left room ${roomId}`);
    io.to(roomId).emit("user_left", { userId: socket.join, roomId });
  });

  // Send message to a room
  socket.on("send_message", ({ roomId, message }) => {
    io.to(roomId).emit("receive_message", { userId: socket.id, message });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

server.listen(port, () => {
  return console.log(`Express is listening on port ${port}`);
});
