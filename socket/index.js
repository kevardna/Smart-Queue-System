import { Server } from "socket.io";
import express from "express";

const app = express();
app.use(express.json());

export const io = new Server(3456, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.8:3000"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-queue", (queueId) => {
    socket.join(`queue_${queueId}`);
  });
});

const emitQueueUpdate = (queue) => {
  io.to(`queue_${queue.id}`).emit("queue-updated", queue);
  io.emit("display-updated");
};

app.post("/emit/queue-called", (req, res) => {
  emitQueueUpdate(req.body.queue);
  res.json({ success: true });
});

app.post("/emit/queue-skipped", (req, res) => {
  emitQueueUpdate(req.body.queue);
  res.json({ success: true });
});

app.post("/emit/queue-finished", (req, res) => {
  emitQueueUpdate(req.body.queue);
  res.json({ success: true });
});

app.post("/emit/display-updated", (req, res) => {
  io.emit("display-updated");
  res.json({ success: true });
});

app.listen(4000, () => {
  console.log("Emit server running on :4000");
});

console.log("Socket.IO running on :3456");
