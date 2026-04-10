export type UserRole = "super_admin" | "university_admin" | "reviewer" | "teacher";

export type SyllabusStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "archived";

export type SyllabusLanguage = "uzbek" | "russian" | "english";

export interface TextbookEntry {
  title: string;
  author: string;
  year: number;
  publisher?: string;
  required: boolean;
}

export interface OnlineResourceEntry {
  name: string;
  url: string;
  description?: string;
}

export interface GradingPolicy {
  current_control: number;
  midterm: number;
  final: number;
}

export interface WeekEntry {
  week: number;
  topic: string;
  lecture_content?: string;
  practice_content?: string;
  self_study?: string;
  description?: string;
  activities?: string | string[];
  assessment?: string;
  hours?: { lecture: number; practice: number; self_study: number };
}

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
  content: { weeks?: WeekEntry[]; assessment_breakdown?: unknown; required_textbooks?: string[]; recommended_resources?: string[] } | null;
  status: SyllabusStatus;
  university_id: string;
  created_by: string;
  reviewed_by: string | null;
  review_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields
  department: string | null;
  faculty: string | null;
  specialization: string | null;
  academic_year: string | null;
  semester: number | null;
  language: string | null;
  prerequisites: string | null;
  lecture_hours: number | null;
  practice_hours: number | null;
  lab_hours: number | null;
  self_study_hours: number | null;
  grading_policy: GradingPolicy | null;
  attendance_policy: string | null;
  passing_grade: number | null;
  textbooks: TextbookEntry[] | null;
  online_resources: OnlineResourceEntry[] | null;
  learning_outcomes: string[] | null;
  competencies: string[] | null;
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
  mapped: {
    description?: string;
    objectives?: string;
    content?: {
      weeks: WeekEntry[];
      assessment_breakdown: unknown[];
      required_textbooks: string[];
      recommended_resources: string[];
    };
    learning_outcomes?: string[];
    competencies?: string[];
    grading_policy?: GradingPolicy;
    attendance_policy?: string;
    passing_grade?: number;
    textbooks?: TextbookEntry[];
    online_resources?: OnlineResourceEntry[];
  } | null;
  tokens_used: number;
}

export interface UserListResponse {
  items: User[];
  total: number;
}

export interface ApiError {
  detail: string;
}
