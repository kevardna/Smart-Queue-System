import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [services] = await db.query<RowDataPacket[]>(
      `SELECT id, name FROM services WHERE is_active = 1`
    );

    const result = [];

    for (const service of services) {
      const [currentRows] = await db.query<RowDataPacket[]>(
        `SELECT id, queue_code, called_at
         FROM queues
         WHERE service_id = ?
           AND status = 'CALLING'
           AND queue_date = CURDATE()
         ORDER BY called_at DESC
         LIMIT 1`,
        [service.id]
      );

      const [nextRows] = await db.query<RowDataPacket[]>(
        `SELECT id, queue_code, created_at
         FROM queues
         WHERE service_id = ?
           AND status = 'WAITING'
           AND queue_date = CURDATE()
         ORDER BY created_at ASC
         LIMIT 3`,
        [service.id]
      );

      result.push({
        service_id: service.id,
        service_name: service.name,
        current: currentRows[0] ?? null,
        nextQueues: nextRows,
      });
    }

    return successResponse("Queue display retrieved", result);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to get queue display", 500);
  }
}