import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";

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

    const [skippedRows] = await db.query<RowDataPacket[]>(
      `SELECT q.id, q.service_id, q.queue_date, q.queue_code, q.status, s.name AS service_name
       FROM queues q
       JOIN services s ON s.id = q.service_id
       WHERE q.id = ?`,
      [queue_id]
    );

    const skippedQueue = skippedRows[0];

    await fetch("http://localhost:4000/emit/queue-skipped", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queue: skippedQueue }),
    });


    const [nextRows] = await db.query<RowDataPacket[]>(
      `SELECT id
       FROM queues
       WHERE service_id = ?
         AND queue_date = CURDATE()
         AND status = 'WAITING'
       ORDER BY queue_number ASC
       LIMIT 1`,
      [skippedQueue.service_id]
    );

    if (nextRows.length > 0) {
      const nextQueueId = nextRows[0].id;

      await db.query(
        `UPDATE queues
         SET status = 'CALLING', called_at = NOW()
         WHERE id = ?`,
        [nextQueueId]
      );

      await db.query(
        `INSERT INTO queue_logs (queue_id, from_status, to_status, changed_by)
         VALUES (?, 'WAITING', 'CALLING', ?)`,
        [nextQueueId, user_id]
      );

      const [calledRows] = await db.query<RowDataPacket[]>(
        `SELECT q.id, q.queue_code, q.status, s.name AS service_name, q.called_at
         FROM queues q
         JOIN services s ON s.id = q.service_id
         WHERE q.id = ?`,
        [nextQueueId]
      );

      await fetch("http://localhost:4000/emit/queue-called", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue: calledRows[0] }),
      });
    }

    return successResponse("Queue skipped & auto next called", {
      skipped_queue_id: queue_id,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to skip queue", 500);
  }
}