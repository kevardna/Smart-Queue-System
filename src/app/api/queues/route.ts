import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { service_id } = await req.json();

    const today = new Date().toISOString().slice(0, 10);

    const [lastQueue] = await db.query<RowDataPacket[]>(
      `SELECT MAX(queue_number) AS lastNumber
       FROM queues
       WHERE service_id = ? AND queue_date = ?`,
      [service_id, today],
    );

    const nextNumber = (lastQueue?.[0]?.lastNumber || 0) + 1;

    const serviceCodeRows = await db.query<RowDataPacket[]>(
      `SELECT code FROM services WHERE id = ? LIMIT 1`,
      [service_id],
    );

    const serviceCode = serviceCodeRows[0]?.[0]?.code;
    const queueCode = `${serviceCode}-${nextNumber}`;

    const [result] = await db.query(
      `INSERT INTO queues (service_id, queue_number, queue_code, queue_date)
       VALUES (?, ?, ?, ?)`,
      [service_id, nextNumber, queueCode, today],
    );

    const [waitingRows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
      FROM queues
      WHERE service_id = ?
      AND status = 'WAITING'
      AND queue_date = ?`,
      [service_id, today],
    );

    const waitingCount = waitingRows[0].total;

    if (waitingCount <= 3) {
      await fetch("http://localhost:4000/emit/display-updated", {
        method: "POST",
      });
    }

    const responseResult = result as { insertId: number };

    return successResponse("Queue created", {
      id: responseResult.insertId,
      queue_number: nextNumber,
      queue_code: queueCode,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create queue", 500);
  }
}
