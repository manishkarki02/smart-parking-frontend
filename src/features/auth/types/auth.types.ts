import { Roles } from "@/config/enums";

export type USER_ROLES = (typeof Roles)[keyof typeof Roles] | "ADMIN";
export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: USER_ROLES;
  banned?: boolean;
  approved?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer" | string;
  expiresIn: number;
  userId: string;
  name: string;
  email: string;
  role: USER_ROLES;
  banned: boolean;
  approved: boolean;
}
