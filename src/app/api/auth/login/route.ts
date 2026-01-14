import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { LoginRequest } from "@/types/authType";
import { RowDataPacket } from "mysql2";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, email, password, role, counter_id
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return errorResponse("Email or password is incorrect", 401);
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse("Email or password is incorrect", 401);
    }

    const token: string = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      counter_id: user.counter_id,
    });

    const res = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        counter_id: user.counter_id,
      },
    };

    return successResponse("Login successful", res);
  } catch (error) {
    console.error(error);
    return errorResponse("Internal server error");
  }
}
