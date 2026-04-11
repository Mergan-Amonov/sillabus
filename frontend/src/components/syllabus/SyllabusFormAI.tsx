"use client";
import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, X, Check } from "lucide-react";
import { generateAI } from "@/lib/syllabuses";
import type { SyllabusFormData } from "./types";
import type { AIGenerateResponse, GradingPolicy, TextbookEntry, OnlineResourceEntry, WeekEntry } from "@/types";

interface Props {
  formData: Pick<
    SyllabusFormData,
    "title" | "course_code" | "credit_hours" | "department" | "faculty" | "language" | "semester" | "academic_year" | "lecture_hours" | "practice_hours" | "self_study_hours" | "prerequisites" | "content"
  >;
  onApply: (updates: Partial<SyllabusFormData>) => void;
  onClose: () => void;
}

interface FieldChoice {
  key: keyof SyllabusFormData | "content";
  label: string;
  preview: string;
  value: unknown;
}

export function SyllabusFormAI({ formData, onApply, onClose }: Props) {
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AIGenerateResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (generating) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [generating]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const res = await generateAI({
        course_title: formData.title,
        course_code: formData.course_code,
        credit_hours: formData.credit_hours,
        level: "undergraduate",
        department: formData.department || undefined,
        faculty: formData.faculty || undefined,
        language: formData.language,
        semester: formData.semester,
        academic_year: formData.academic_year || undefined,
        lecture_hours: formData.lecture_hours ? Number(formData.lecture_hours) : undefined,
        practice_hours: formData.practice_hours ? Number(formData.practice_hours) : undefined,
        self_study_hours: formData.self_study_hours ? Number(formData.self_study_hours) : undefined,
        prerequisites: formData.prerequisites || undefined,
        instructions: instructions || undefined,
      });
      setResult(res);
      // Select all by default
      if (res.mapped) {
        const all = new Set(getChoices(res.mapped).map((c) => c.key as string));
        setSelected(all);
      }
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { detail?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.detail || axiosErr?.message;
      setError(msg || "AI generatsiyada xatolik yuz berdi");
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (!result?.mapped) return;
    const choices = getChoices(result.mapped);
    const updates: Partial<SyllabusFormData> = {};

    for (const choice of choices) {
      if (!selected.has(choice.key as string)) continue;
      const key = choice.key as keyof SyllabusFormData;

      if (key === "description") updates.description = choice.value as string;
      else if (key === "learning_outcomes") updates.learning_outcomes = choice.value as string[];
      else if (key === "competencies") updates.competencies = choice.value as string[];
      else if (key === "grading_policy") updates.grading_policy = choice.value as GradingPolicy;
      else if (key === "attendance_policy") updates.attendance_policy = choice.value as string;
      else if (key === "passing_grade") updates.passing_grade = String(choice.value);
      else if (key === "textbooks") updates.textbooks = choice.value as TextbookEntry[];
      else if (key === "online_resources") updates.online_resources = choice.value as OnlineResourceEntry[];
      else if (key === "content") {
        // Merge with existing content to preserve self_study and other manually-entered data
        updates.content = { ...formData.content, ...(choice.value as Record<string, unknown>) };
      }
    }

    onApply(updates);
    onClose();
  };

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const choices = result?.mapped ? getChoices(result.mapped) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600" />
            <h2 className="text-base font-semibold text-gray-900">AI yordamida to&apos;ldirish</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!result ? (
            <>
              <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
                AI kurs ma&apos;lumotlari asosida tavsif, o&apos;quv natijalari, baholash tizimi va boshqa bo&apos;limlarni avtomatik to&apos;ldiradi.
                <span className="block mt-1 text-purple-600 text-xs">Jarayon 1-2 daqiqa olishi mumkin. Sahifani yopmang.</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qo&apos;shimcha ko&apos;rsatmalar
                  <span className="text-gray-400 font-normal ml-2">(ixtiyoriy)</span>
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="Masalan: Amaliy loyihalarga e'tibor bering, ma'ruza va amaliy nisbatini 50/50 qiling..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
                <Check size={15} className="shrink-0" />
                AI muvaffaqiyatli generatsiya qildi. Qaysi bo&apos;limlarni qabul qilishni tanlang:
              </div>

              <div className="space-y-2">
                {choices.map((choice) => (
                  <label
                    key={choice.key as string}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selected.has(choice.key as string)
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(choice.key as string)}
                      onChange={() => toggle(choice.key as string)}
                      className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{choice.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{choice.preview}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setSelected(new Set());
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Qayta generatsiya
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          {!result ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !formData.title || !formData.course_code}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>
                    Generatsiya qilinmoqda
                    {elapsed > 0 && <span className="opacity-75 ml-1">({elapsed}s)</span>}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generatsiya qilish
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              disabled={selected.size === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Check size={15} />
              Qabul qilish ({selected.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getChoices(mapped: NonNullable<AIGenerateResponse["mapped"]>): FieldChoice[] {
  const choices: FieldChoice[] = [];

  if (mapped.description) {
    choices.push({
      key: "description",
      label: "Kurs tavsifi",
      preview: mapped.description.slice(0, 80) + "...",
      value: mapped.description,
    });
  }
  if (mapped.learning_outcomes?.length) {
    choices.push({
      key: "learning_outcomes",
      label: `O'quv natijalari (${mapped.learning_outcomes.length} ta)`,
      preview: mapped.learning_outcomes[0] ?? "",
      value: mapped.learning_outcomes,
    });
  }
  if (mapped.competencies?.length) {
    choices.push({
      key: "competencies",
      label: `Kompetensiyalar (${mapped.competencies.length} ta)`,
      preview: mapped.competencies.join(", ").slice(0, 80),
      value: mapped.competencies,
    });
  }
  if (mapped.grading_policy) {
    const gp = mapped.grading_policy;
    choices.push({
      key: "grading_policy",
      label: "Baholash tizimi",
      preview: `Joriy: ${gp.current_control}%, Oraliq: ${gp.midterm}%, Yakuniy: ${gp.final}%`,
      value: gp,
    });
  }
  if (mapped.attendance_policy) {
    choices.push({
      key: "attendance_policy",
      label: "Davomat talablari",
      preview: mapped.attendance_policy.slice(0, 80),
      value: mapped.attendance_policy,
    });
  }
  if (mapped.passing_grade !== undefined) {
    choices.push({
      key: "passing_grade",
      label: `O'tish bali`,
      preview: `${mapped.passing_grade} ball`,
      value: mapped.passing_grade,
    });
  }
  if (mapped.textbooks?.length) {
    choices.push({
      key: "textbooks",
      label: `Darsliklar (${mapped.textbooks.length} ta)`,
      preview: ((mapped.textbooks[0] as TextbookEntry)?.title ?? ""),
      value: mapped.textbooks,
    });
  }
  if (mapped.online_resources?.length) {
    choices.push({
      key: "online_resources",
      label: `Onlayn resurslar (${mapped.online_resources.length} ta)`,
      preview: ((mapped.online_resources[0] as OnlineResourceEntry)?.name ?? ""),
      value: mapped.online_resources,
    });
  }
  if (mapped.content?.weeks?.length) {
    choices.push({
      key: "content",
      label: `Haftalik jadval (${mapped.content.weeks.length} hafta)`,
      preview: ((mapped.content.weeks[0] as WeekEntry)?.topic ?? ""),
      value: { weeks: mapped.content.weeks, assessment_breakdown: mapped.content.assessment_breakdown ?? [] },
    });
  }

  return choices;
}
