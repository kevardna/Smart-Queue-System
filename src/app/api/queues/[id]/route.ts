import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
        q.id,
        q.queue_code,
        q.status,
        q.queue_date,
        q.created_at,
        s.name AS service_name
       FROM queues q
       JOIN services s ON s.id = q.service_id
       WHERE q.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return errorResponse("Queue not found", 404);
    }

    return successResponse("Queue retrieved", rows[0]);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to retrieve queue", 500);
  }
}