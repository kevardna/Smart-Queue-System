import jwt from "jsonwebtoken"
import { JWTPayloadType } from "@/types/jwtType"

export function signToken(payload: JWTPayloadType) {
  const secret = process.env.JWT_SECRET!
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  })
}

export function verifyToken(token?: string) {
  const secret = process.env.JWT_SECRET!

  if (!token) {
    throw new Error("Unauthorized")
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: number
      counter_id: number
      role: "ADMIN" | "STAFF"
    }

    return decoded
  } catch {
    throw new Error("Invalid token")
  }
}
