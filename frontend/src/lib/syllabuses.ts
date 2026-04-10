import { api } from "./api";
import type { Syllabus, SyllabusListResponse, AIGenerateResponse, TextbookEntry, OnlineResourceEntry, GradingPolicy } from "@/types";

export type SyllabusPayload = Partial<{
  title: string;
  course_code: string;
  credit_hours: number;
  description: string;
  objectives: string;
  content: Record<string, unknown>;
  department: string;
  faculty: string;
  specialization: string;
  academic_year: string;
  semester: number;
  language: string;
  prerequisites: string;
  lecture_hours: number;
  practice_hours: number;
  lab_hours: number;
  self_study_hours: number;
  grading_policy: GradingPolicy;
  attendance_policy: string;
  passing_grade: number;
  textbooks: TextbookEntry[];
  online_resources: OnlineResourceEntry[];
  learning_outcomes: string[];
  competencies: string[];
}>;

export async function listSyllabuses(
  page = 1,
  size = 20,
  status?: string
): Promise<SyllabusListResponse> {
  const params: Record<string, unknown> = { page, size };
  if (status) params.status = status;
  const { data } = await api.get<SyllabusListResponse>("/syllabuses", { params });
  return data;
}

export async function getSyllabus(id: string): Promise<Syllabus> {
  const { data } = await api.get<Syllabus>(`/syllabuses/${id}`);
  return data;
}

export async function createSyllabus(
  payload: Pick<SyllabusPayload, "title" | "course_code" | "credit_hours"> &
    Omit<SyllabusPayload, "title" | "course_code" | "credit_hours">
): Promise<Syllabus> {
  const { data } = await api.post<Syllabus>("/syllabuses", payload);
  return data;
}

export async function updateSyllabus(
  id: string,
  payload: SyllabusPayload
): Promise<Syllabus> {
  const { data } = await api.patch<Syllabus>(`/syllabuses/${id}`, payload);
  return data;
}

export async function deleteSyllabus(id: string): Promise<void> {
  await api.delete(`/syllabuses/${id}`);
}

export async function submitForReview(id: string): Promise<Syllabus> {
  const { data } = await api.post<Syllabus>(`/syllabuses/${id}/submit`);
  return data;
}

export async function reviewSyllabus(
  id: string,
  action: "approve" | "reject",
  comment?: string
): Promise<Syllabus> {
  const { data } = await api.post<Syllabus>(`/syllabuses/${id}/review`, { action, comment });
  return data;
}

export async function generateAI(payload: {
  course_title: string;
  course_code: string;
  credit_hours: number;
  level?: string;
  department?: string;
  faculty?: string;
  language?: string;
  semester?: number;
  academic_year?: string;
  lecture_hours?: number;
  practice_hours?: number;
  lab_hours?: number;
  self_study_hours?: number;
  prerequisites?: string;
  instructions?: string;
}): Promise<AIGenerateResponse> {
  const { data } = await api.post<AIGenerateResponse>("/ai/generate", payload);
  return data;
}

export function exportUrl(id: string, format: "pdf" | "docx"): string {
  return `/api/v1/export/${id}/${format}`;
}
