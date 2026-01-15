import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const service_id = searchParams.get("service_id");

    const [queue] = await db.query(
      `SELECT *
       FROM queues
       WHERE service_id = ?
         AND status = 'WAITING'
         AND queue_date = CURDATE()
       ORDER BY queue_number ASC
       LIMIT 1`,
      [service_id]
    );

    if (!queue) {
      return successResponse("No queue available", null);
    }

    return successResponse("Next queue retrieved", queue);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get next queue", 500);
  }
}
