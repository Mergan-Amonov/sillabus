import type { Syllabus, GradingPolicy, TextbookEntry, OnlineResourceEntry, SyllabusLanguage } from "@/types";
import type { SyllabusPayload } from "@/lib/syllabuses";

export interface SyllabusFormData {
  // Step 1: Asosiy
  title: string;
  course_code: string;
  credit_hours: number;
  department: string;
  faculty: string;
  specialization: string;
  academic_year: string;
  semester: 1 | 2;
  language: SyllabusLanguage;
  prerequisites: string;
  description: string;
  // Step 2: Soatlar
  lecture_hours: string;
  practice_hours: string;
  lab_hours: string;
  self_study_hours: string;
  // Step 3: Baholash
  grading_policy: GradingPolicy;
  passing_grade: string;
  attendance_policy: string;
  // Step 4: Natijalar
  learning_outcomes: string[];
  competencies: string[];
  // Step 5: Adabiyotlar
  textbooks: TextbookEntry[];
  online_resources: OnlineResourceEntry[];
  // AI-generated weekly content (transparent)
  content: Record<string, unknown>;
}

const yr = new Date().getFullYear();

export const DEFAULT_FORM: SyllabusFormData = {
  title: "",
  course_code: "",
  credit_hours: 3,
  department: "",
  faculty: "",
  specialization: "",
  academic_year: `${yr}-${yr + 1}`,
  semester: 1,
  language: "uzbek",
  prerequisites: "",
  description: "",
  lecture_hours: "",
  practice_hours: "",
  lab_hours: "",
  self_study_hours: "",
  grading_policy: { current_control: 30, midterm: 30, final: 40 },
  passing_grade: "55",
  attendance_policy: "",
  learning_outcomes: [],
  competencies: [],
  textbooks: [],
  online_resources: [],
  content: {},
};

export const LANGUAGE_LABELS: Record<SyllabusLanguage, string> = {
  uzbek: "O'zbek",
  russian: "Русский",
  english: "English",
};

export const STEPS = [
  { label: "Asosiy", short: "1" },
  { label: "Soatlar", short: "2" },
  { label: "Baholash", short: "3" },
  { label: "Natijalar", short: "4" },
  { label: "Adabiyotlar", short: "5" },
  { label: "Yakuniy", short: "6" },
] as const;

// Normalize a language string from backend to SyllabusLanguage
function normalizeLang(lang: string | null | undefined): SyllabusLanguage {
  if (!lang) return "uzbek";
  const lower = lang.toLowerCase();
  if (lower === "russian" || lower === "rus" || lower === "ru") return "russian";
  if (lower === "english" || lower === "ingliz" || lower === "en") return "english";
  return "uzbek";
}

export function syllabusToForm(s: Syllabus): SyllabusFormData {
  return {
    title: s.title,
    course_code: s.course_code,
    credit_hours: s.credit_hours,
    department: s.department ?? "",
    faculty: s.faculty ?? "",
    specialization: s.specialization ?? "",
    academic_year: s.academic_year ?? "",
    semester: (s.semester === 2 ? 2 : 1),
    language: normalizeLang(s.language),
    prerequisites: s.prerequisites ?? "",
    description: s.description ?? "",
    lecture_hours: s.lecture_hours?.toString() ?? "",
    practice_hours: s.practice_hours?.toString() ?? "",
    lab_hours: s.lab_hours?.toString() ?? "",
    self_study_hours: s.self_study_hours?.toString() ?? "",
    grading_policy: s.grading_policy ?? { current_control: 30, midterm: 30, final: 40 },
    passing_grade: s.passing_grade?.toString() ?? "55",
    attendance_policy: s.attendance_policy ?? "",
    learning_outcomes: s.learning_outcomes ?? [],
    competencies: s.competencies ?? [],
    textbooks: s.textbooks ?? [],
    online_resources: s.online_resources ?? [],
    content: (s.content as Record<string, unknown>) ?? {},
  };
}

export function formToPayload(form: SyllabusFormData): SyllabusPayload {
  const payload: SyllabusPayload = {
    title: form.title.trim(),
    course_code: form.course_code.trim().toUpperCase(),
    credit_hours: form.credit_hours,
    language: form.language,
    semester: form.semester,
    grading_policy: form.grading_policy,
    passing_grade: form.passing_grade ? Number(form.passing_grade) : undefined,
    content: Object.keys(form.content).length > 0 ? form.content : undefined,
  };

  if (form.department) payload.department = form.department;
  if (form.faculty) payload.faculty = form.faculty;
  if (form.specialization) payload.specialization = form.specialization;
  if (form.academic_year) payload.academic_year = form.academic_year;
  if (form.prerequisites) payload.prerequisites = form.prerequisites;
  if (form.description) payload.description = form.description;
  if (form.lecture_hours) payload.lecture_hours = Number(form.lecture_hours);
  if (form.practice_hours) payload.practice_hours = Number(form.practice_hours);
  if (form.lab_hours) payload.lab_hours = Number(form.lab_hours);
  if (form.self_study_hours) payload.self_study_hours = Number(form.self_study_hours);
  if (form.attendance_policy) payload.attendance_policy = form.attendance_policy;
  if (form.learning_outcomes.length > 0) {
    payload.learning_outcomes = form.learning_outcomes.filter(Boolean);
    payload.objectives = form.learning_outcomes.filter(Boolean).join("\n");
  }
  if (form.competencies.length > 0) payload.competencies = form.competencies.filter(Boolean);
  if (form.textbooks.length > 0) payload.textbooks = form.textbooks;
  if (form.online_resources.length > 0) payload.online_resources = form.online_resources;

  return payload;
}
