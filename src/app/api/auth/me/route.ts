import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/response";
import { JwtPayload } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return errorResponse("Token not found", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse("Token not found", 401);
    }

    const decoded = verifyToken(token) as JwtPayload;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, email, role, counter_id
       FROM users
       WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return errorResponse("User not found", 404);
    }

    return successResponse("Successfully retrieved user data", rows[0]);
  } catch (error: any) {
    console.error(error);

    if (error.name === "JsonWebTokenError") {
      return errorResponse("Invalid token", 401);
    }

    if (error.name === "TokenExpiredError") {
      return errorResponse("Token expired", 401);
    }

    return errorResponse("Server error", 500);
  }
}
