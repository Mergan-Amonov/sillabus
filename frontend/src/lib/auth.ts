import { api } from "./api";
import type { User } from "@/types";

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<User>("/auth/login", { email, password });
  return data;
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

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function updateAiSettings(payload: {
  openai_api_key?: string | null;
  ai_base_url?: string | null;
  ai_model?: string | null;
}): Promise<User> {
  const { data } = await api.patch<User>("/auth/me/api-key", payload);
  return data;
}
