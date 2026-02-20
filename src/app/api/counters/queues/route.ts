import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader) {
      return errorResponse("No token provided", 401);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      counter_id: number;
      role: "ADMIN" | "STAFF";
    };

    const [counterRows] = await db.query<RowDataPacket[]>(
      `SELECT id, service_id, name
       FROM counters 
       WHERE id = ?`,
      [decoded.counter_id]
    );

    const counter = counterRows[0];
    if (!counter) {
      return errorResponse("Counter not found", 404);
    }

    const [nextRows] = await db.query<RowDataPacket[]>(
      `SELECT id, queue_code, status, created_at
       FROM queues
       WHERE service_id = ?
         AND (status = 'WAITING' OR status = 'CALLING') 
         AND queue_date = CURDATE()
       ORDER BY created_at ASC
       LIMIT 5`,
      [counter.service_id]
    );

    return successResponse("Counter queues retrieved", {
      counter_id: counter.id,
      counter_name: counter.name,
      service_id: counter.service_id,
      nextQueues: nextRows,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Invalid or expired token", 401);
  }
}