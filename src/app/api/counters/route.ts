import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        c.id,
        c.name,
        c.is_active,
        s.id AS service_id,
        s.name AS service_name,
        s.code AS service_code
       FROM counters c
       JOIN services s ON c.service_id = s.id
       WHERE c.is_active = TRUE
       ORDER BY c.name ASC`
    );

    return successResponse("Successfully retrieved counters", rows);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to retrieve counters", 500);
  }
}