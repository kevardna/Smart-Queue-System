import { JwtPayload } from "jsonwebtoken";

export interface JWTPayloadType extends JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  counter_id: number | null;
};