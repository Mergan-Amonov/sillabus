export type UserRole = "super_admin" | "university_admin" | "reviewer" | "teacher";

export type SyllabusStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "archived";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  university_id: string | null;
  created_at: string;
  has_openai_key: boolean;
  ai_base_url: string | null;
  ai_model: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Syllabus {
  id: string;
  title: string;
  course_code: string;
  credit_hours: number;
  description: string | null;
  objectives: string | null;
  content: Record<string, unknown> | null;
  status: SyllabusStatus;
  university_id: string;
  created_by: string;
  reviewed_by: string | null;
  review_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyllabusListResponse {
  items: Syllabus[];
  total: number;
  page: number;
  size: number;
}

export interface AIGenerateResponse {
  prompt_version: string;
  generated: Record<string, unknown>;
  tokens_used: number;
}

export interface UserListResponse {
  items: User[];
  total: number;
}

export interface ApiError {
  detail: string;
}
