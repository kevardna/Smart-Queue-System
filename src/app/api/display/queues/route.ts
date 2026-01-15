import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
        q.id,
        s.name AS service_name,
        q.queue_code,
        q.status,
        q.created_at,
        q.called_at,
        q.done_at
       FROM queues q
       JOIN services s ON s.id = q.service_id
       WHERE q.queue_date = CURDATE()
       ORDER BY q.created_at ASC`
    );

    return successResponse("All queues retrieved", rows);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to retrieve queues", 500);
  }
}
