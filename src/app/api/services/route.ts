import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, name, code, is_active
       FROM services
       WHERE is_active = TRUE
       ORDER BY name ASC`
    );

    return successResponse("Services retrieved successfully", rows);
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to retrieve services", 500);
  }
}