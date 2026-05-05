import type { Roles } from "@/config/enums";

export type ROLES = (typeof Roles)[keyof typeof Roles];
export type USER_ROLES = ROLES | "ADMIN";
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: ROLES;
}

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
