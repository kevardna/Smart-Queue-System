import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { QueryResult } from "mysql2";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { queue_id } = await req.json();
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return errorResponse("No token provided", 401);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      counter_id: number;
      role: "ADMIN" | "STAFF";
    };

    const user_id = decoded.id;

    await db.query(
      `UPDATE queues
       SET status = 'CALLING', called_at = NOW()
       WHERE id = ?`,
      [queue_id],
    );

    await db.query(
      `INSERT INTO queue_logs (queue_id, from_status, to_status, changed_by)
       VALUES (?, 'WAITING', 'CALLING', ?)`,
      [queue_id, user_id],
    );

    const [rows] = await db.query(
      `SELECT q.id, q.queue_code, q.status, s.name AS service_name, q.created_at, q.called_at, q.done_at
      FROM queues q
      JOIN services s ON s.id = q.service_id
      WHERE q.id = ?`,
      [queue_id],
    );

    await fetch("http://localhost:4000/emit/queue-called", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queue: (rows as QueryResult[])[0] }),
    });

    return successResponse("Queue called successfully", { queue_id, user_id });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to call queue", 500);
  }
}
