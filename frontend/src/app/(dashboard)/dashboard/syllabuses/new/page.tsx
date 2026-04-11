"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ChevronLeft, Save, Loader2 } from "lucide-react";

import { createSyllabus } from "@/lib/syllabuses";
import { StepIndicator } from "@/components/syllabus/StepIndicator";
import { SyllabusFormBasic } from "@/components/syllabus/SyllabusFormBasic";
import { SyllabusFormHours } from "@/components/syllabus/SyllabusFormHours";
import { SyllabusFormGrading } from "@/components/syllabus/SyllabusFormGrading";
import { SyllabusFormOutcomes } from "@/components/syllabus/SyllabusFormOutcomes";
import { SyllabusFormResources } from "@/components/syllabus/SyllabusFormResources";
import { SyllabusFormAI } from "@/components/syllabus/SyllabusFormAI";
import { SyllabusFormWeekly } from "@/components/syllabus/SyllabusFormWeekly";
import { SyllabusFormMeta } from "@/components/syllabus/SyllabusFormMeta";
import { DEFAULT_FORM, formToPayload, LANGUAGE_LABELS, STEPS } from "@/components/syllabus/types";
import type { SyllabusFormData } from "@/components/syllabus/types";

const LS_KEY = "syllabus_draft_new";

function loadDraft(): SyllabusFormData {
  if (typeof window === "undefined") return DEFAULT_FORM;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_FORM;
    return { ...DEFAULT_FORM, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FORM;
  }
}

function saveDraft(form: SyllabusFormData) {
  localStorage.setItem(LS_KEY, JSON.stringify(form));
}

function clearDraft() {
  localStorage.removeItem(LS_KEY);
}

export default function NewSyllabusPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SyllabusFormData>(DEFAULT_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAI, setShowAI] = useState(false);

  // Load draft from localStorage after hydration
  useEffect(() => {
    setForm(loadDraft());
    setHydrated(true);
  }, []);

  // Save to localStorage on form change
  useEffect(() => {
    if (hydrated) saveDraft(form);
  }, [form, hydrated]);

  const update = (updates: Partial<SyllabusFormData>) =>
    setForm((f) => ({ ...f, ...updates }));

  const canNext = () => {
    if (step === 1) return form.title.trim() && form.course_code.trim() && form.credit_hours > 0;
    return true;
  };

  const handleSave = async (andSubmit = false) => {
    if (!form.title.trim() || !form.course_code.trim()) {
      setError("Fan nomi va kodi majburiy");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = formToPayload(form);
      const syllabus = await createSyllabus(payload as Parameters<typeof createSyllabus>[0]);
      clearDraft();
      if (andSubmit) {
        const { submitForReview } = await import("@/lib/syllabuses");
        await submitForReview(syllabus.id);
      }
      router.push(`/dashboard/syllabuses/${syllabus.id}`);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Saqlashda xatolik yuz berdi");
      setSaving(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl pb-12">
      <div className="mb-6">
        <Link
          href="/dashboard/syllabuses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={15} /> Orqaga
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yangi syllabus</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ma&apos;lumotlar avtomatik saqlanadi
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          {STEPS[step - 1].label}
        </h2>

        {step === 1 && (
          <SyllabusFormBasic data={form} onChange={update} onAI={() => setShowAI(true)} />
        )}
        {step === 2 && <SyllabusFormHours data={form} onChange={update} />}
        {step === 3 && <SyllabusFormGrading data={form} onChange={update} />}
        {step === 4 && <SyllabusFormOutcomes data={form} onChange={update} />}
        {step === 5 && <SyllabusFormResources data={form} onChange={update} />}
        {step === 6 && <SyllabusFormWeekly data={form} onChange={update} onAI={() => setShowAI(true)} />}
        {step === 7 && <SyllabusFormMeta data={form} onChange={update} />}
        {step === 8 && <ReviewStep form={form} />}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={15} /> Orqaga
          </button>
        ) : (
          <div />
        )}

        <div className="flex-1" />

        {step < 8 ? (
          <button
            onClick={() => canNext() && setStep((s) => s + 1)}
            disabled={!canNext()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            Keyingi <ChevronRight size={15} />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Saqlash (Qoralama)
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Saqlash va yuborish
            </button>
          </div>
        )}
      </div>

      {showAI && (
        <SyllabusFormAI
          formData={form}
          onApply={(updates) => {
            update(updates);
          }}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}

function ReviewStep({ form }: { form: SyllabusFormData }) {
  const total =
    (Number(form.lecture_hours) || 0) +
    (Number(form.practice_hours) || 0) +
    (Number(form.lab_hours) || 0) +
    (Number(form.self_study_hours) || 0);

  return (
    <div className="space-y-5 text-sm">
      <ReviewSection title="Asosiy ma'lumotlar">
        <ReviewRow label="Fan nomi" value={form.title} />
        <ReviewRow label="Fan kodi" value={form.course_code} />
        <ReviewRow label="Kredit soat" value={String(form.credit_hours)} />
        {form.department && <ReviewRow label="Kafedra" value={form.department} />}
        {form.faculty && <ReviewRow label="Fakultet" value={form.faculty} />}
        {form.academic_year && <ReviewRow label="O'quv yili" value={form.academic_year} />}
        <ReviewRow label="Semestr" value={`${form.semester}-semestr`} />
        <ReviewRow label="Til" value={LANGUAGE_LABELS[form.language]} />
      </ReviewSection>

      {total > 0 && (
        <ReviewSection title="Soatlar">
          <ReviewRow label="Jami" value={`${total} soat`} />
          {form.lecture_hours && <ReviewRow label="Ma'ruza" value={`${form.lecture_hours} soat`} />}
          {form.practice_hours && <ReviewRow label="Amaliy" value={`${form.practice_hours} soat`} />}
          {form.lab_hours && <ReviewRow label="Lab" value={`${form.lab_hours} soat`} />}
          {form.self_study_hours && <ReviewRow label="Mustaqil" value={`${form.self_study_hours} soat`} />}
        </ReviewSection>
      )}

      <ReviewSection title="Baholash">
        <ReviewRow label="Joriy nazorat" value={`${form.grading_policy.current_control}%`} />
        <ReviewRow label="Oraliq" value={`${form.grading_policy.midterm}%`} />
        <ReviewRow label="Yakuniy" value={`${form.grading_policy.final}%`} />
        <ReviewRow label="O'tish bali" value={`${form.passing_grade} ball`} />
      </ReviewSection>

      {form.learning_outcomes.length > 0 && (
        <ReviewSection title={`O'quv natijalari (${form.learning_outcomes.length})`}>
          {form.learning_outcomes.slice(0, 3).map((o, i) => (
            <p key={i} className="text-gray-600 pl-2">• {o}</p>
          ))}
          {form.learning_outcomes.length > 3 && (
            <p className="text-gray-400">+{form.learning_outcomes.length - 3} ta</p>
          )}
        </ReviewSection>
      )}

      {(form.textbooks.length > 0 || form.online_resources.length > 0) && (
        <ReviewSection title="Resurslar">
          {form.textbooks.length > 0 && (
            <ReviewRow label="Darsliklar" value={`${form.textbooks.length} ta`} />
          )}
          {form.online_resources.length > 0 && (
            <ReviewRow label="Onlayn resurslar" value={`${form.online_resources.length} ta`} />
          )}
        </ReviewSection>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-gray-100">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-32 shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium">{value || "—"}</span>
    </div>
  );
}
