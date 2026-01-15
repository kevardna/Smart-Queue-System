import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT s.name AS service,
              q.queue_code,
              q.status,
              q.called_at
       FROM services s
       LEFT JOIN queues q
         ON q.service_id = s.id
        AND q.status = 'CALLING'
        AND q.queue_date = CURDATE()
       ORDER BY s.name ASC`
    );

    return successResponse("Queue status retrieved", rows);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get queue status", 500);
  }
}