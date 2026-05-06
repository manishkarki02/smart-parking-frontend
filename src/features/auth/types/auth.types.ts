import { Roles } from "@/config/enums";

export type USER_ROLES = (typeof Roles)[keyof typeof Roles] | "ADMIN";
export interface AuthUser {
  name: string;
  email: string;
  role: USER_ROLES;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: USER_ROLES;
}
