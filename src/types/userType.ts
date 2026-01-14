export type UserRole = "ADMIN" | "STAFF";

export interface UserType {
  id: number;
  name: string;
  password: string;
  email: string;
  role: UserRole;
  counter_id: number | null;
}