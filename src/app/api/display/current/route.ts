import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows]: [RowDataPacket[], any] = await db.query(
      `
      SELECT
        q.id,
        q.service_id,
        s.name AS service_name,
        q.queue_code,
        q.called_at
      FROM queues q
      JOIN services s ON s.id = q.service_id
      JOIN (
        SELECT service_id, MAX(called_at) AS latest_called
        FROM queues
        WHERE status = 'CALLING'
          AND queue_date = CURDATE()
        GROUP BY service_id
      ) latest
        ON latest.service_id = q.service_id
       AND latest.latest_called = q.called_at
      WHERE q.status = 'CALLING'
        AND q.queue_date = CURDATE()
      ORDER BY s.name ASC
      `
    );

    return successResponse("Current calling queues per service retrieved", rows);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get current queues", 500);
  }
}
