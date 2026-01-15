import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

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

    return successResponse("Queue skipped", { queue_id, user_id });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to skip queue", 500);
  }
}
