import { api } from "./api";
import type { User, UserListResponse, UserRole } from "@/types";

export async function listUsers(page = 1, size = 20): Promise<UserListResponse> {
  const { data } = await api.get<UserListResponse>("/auth/users", { params: { page, size } });
  return data;
}

export async function createUser(payload: {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  university_id?: string;
  is_active?: boolean;
}): Promise<User> {
  const { data } = await api.post<User>("/auth/users", payload);
  return data;
}

export async function updateUser(
  id: string,
  payload: { full_name?: string; role?: UserRole; is_active?: boolean }
): Promise<User> {
  const { data } = await api.patch<User>(`/auth/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/auth/users/${id}`);
}
