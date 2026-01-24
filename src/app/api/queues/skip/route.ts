import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { QueryResult } from "mysql2";

export async function POST(req: Request) {
  try {
    const { queue_id, user_id } = await req.json();

    await db.query(
      `UPDATE queues
       SET status = 'SKIPPED'
       WHERE id = ?`,
      [queue_id]
    );

    await db.query(
      `INSERT INTO queue_logs (queue_id, from_status, to_status, changed_by)
       VALUES (?, 'CALLING', 'SKIPPED', ?)`,
      [queue_id, user_id]
    );

    const [rows] = await db.query(
          `SELECT q.id, q.queue_code, q.status, s.name AS service_name, q.created_at
          FROM queues q
          JOIN services s ON s.id = q.service_id
          WHERE q.id = ?`,
          [queue_id],
        );

    await fetch("http://localhost:4000/emit/queue-skipped", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queue: (rows as QueryResult[])[0] }),
    });

    return successResponse("Queue skipped", { queue_id, user_id });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to skip queue", 500);
  }
}
