import { api, setTokens, clearTokens } from "./api";
import type { User, TokenResponse } from "@/types";

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
  setTokens(data.access_token, data.refresh_token);
  return fetchCurrentUser();
}

export async function register(
  email: string,
  password: string,
  full_name: string,
  university_id?: string
): Promise<User> {
  const { data } = await api.post<User>("/auth/register", {
    email,
    password,
    full_name,
    university_id,
  });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refresh_token: refreshToken });
  clearTokens();
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
