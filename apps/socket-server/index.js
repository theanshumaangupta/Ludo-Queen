// apps/socket/index.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map(); // roomCode -> Set<WebSocket>

wss.on("connection", (ws) => {
  console.log("Client connected");
  let joinedRoom = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      const roomCode = data.room;
      joinedRoom = roomCode;

      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, new Set());
      }
      rooms.get(roomCode).add(ws);

      const messageToSend = JSON.stringify({
        type: "user_joined",
        user: data.user,
      });

      for (const client of rooms.get(roomCode)) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageToSend);
        }
      }
    }
    if (data.type === "leave") {
      const roomCode = data.room;
      joinedRoom = roomCode;

      if (!rooms.has(roomCode)) {
        return
      }
      rooms.get(roomCode).delete(ws);

      const messageToSend = JSON.stringify({
        type: "user_left",
        user: data.user,
      });

      for (const client of rooms.get(roomCode)) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageToSend);
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (joinedRoom && rooms.has(joinedRoom)) {
      rooms.get(joinedRoom).delete(ws);
      if (rooms.get(joinedRoom).size === 0) {
        rooms.delete(joinedRoom);
      }
    }
  });
});

server.listen(3001, () => {
  console.log("WebSocket server running on ws://localhost:3001");
});
