import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
        s.name AS service_name,
        q.queue_code,
        q.called_at
       FROM queues q
       JOIN services s ON s.id = q.service_id
       WHERE q.status = 'CALLING'
         AND q.queue_date = CURDATE()
       ORDER BY q.called_at DESC`
    );

    return successResponse("Current calling queues retrieved", rows);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get current queues", 500);
  }
}