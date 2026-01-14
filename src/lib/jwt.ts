import { JWTPayloadType } from "@/types/jwtType";
import jwt from "jsonwebtoken";

export function signToken(payload: JWTPayloadType) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret!, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret!);
}