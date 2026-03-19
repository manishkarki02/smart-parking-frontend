export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "DRIVER" | "VENDOR";
}

export interface AuthUser {
  name: string;
  email: string;
  role: "DRIVER" | "VENDOR" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: "DRIVER" | "VENDOR" | "ADMIN";
}
