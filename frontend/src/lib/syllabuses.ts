import { api } from "./api";
import type { Syllabus, SyllabusListResponse, AIGenerateResponse } from "@/types";

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

export async function createSyllabus(payload: {
  title: string;
  course_code: string;
  credit_hours: number;
  description?: string;
  objectives?: string;
  content?: Record<string, unknown>;
}): Promise<Syllabus> {
  const { data } = await api.post<Syllabus>("/syllabuses", payload);
  return data;
}

export async function updateSyllabus(
  id: string,
  payload: Partial<{
    title: string;
    credit_hours: number;
    description: string;
    objectives: string;
    content: Record<string, unknown>;
  }>
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
  instructions?: string;
}): Promise<AIGenerateResponse> {
  const { data } = await api.post<AIGenerateResponse>("/ai/generate", payload);
  return data;
}

export function exportUrl(id: string, format: "pdf" | "docx"): string {
  return `/api/v1/export/${id}/${format}`;
}
