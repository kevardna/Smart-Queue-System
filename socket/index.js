import { Server } from "socket.io";
import express from "express";

const app = express();
app.use(express.json());

export const io = new Server(3456, {
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket) => {
  socket.on("join-queue", (queueId) => {
    socket.join(`queue_${queueId}`);
  });
});
  
app.post("/emit/queue-called", (req , res) => {
  const { queue } = req.body;

  io.to(`queue_${queue.id}`).emit("queue-called");
  io.to(`queue_${queue.id}`).emit("queue-updated", queue);

  res.json({ success: true });
});

app.listen(4000, () => {
  console.log("Emit server on :4000");
});

console.log("Socket running on :3456");
