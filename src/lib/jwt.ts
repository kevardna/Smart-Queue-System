import jwt from "jsonwebtoken"
import { JWTPayloadType } from "@/types/jwtType"

export function signToken(payload: JWTPayloadType) {
  const secret = process.env.JWT_SECRET!
  return jwt.sign(payload, secret, {
    expiresIn: "1d",
  })
}

export function verifyToken(token: string): JWTPayloadType {
  const secret = process.env.JWT_SECRET!
  return jwt.verify(token, secret) as JWTPayloadType
}