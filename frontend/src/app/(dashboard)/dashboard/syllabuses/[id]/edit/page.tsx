"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ChevronLeft, Save, Send, Loader2 } from "lucide-react";

import { getSyllabus, updateSyllabus, submitForReview } from "@/lib/syllabuses";
import { StepIndicator } from "@/components/syllabus/StepIndicator";
import { SyllabusFormBasic } from "@/components/syllabus/SyllabusFormBasic";
import { SyllabusFormHours } from "@/components/syllabus/SyllabusFormHours";
import { SyllabusFormGrading } from "@/components/syllabus/SyllabusFormGrading";
import { SyllabusFormOutcomes } from "@/components/syllabus/SyllabusFormOutcomes";
import { SyllabusFormResources } from "@/components/syllabus/SyllabusFormResources";
import { SyllabusFormAI } from "@/components/syllabus/SyllabusFormAI";
import {
  syllabusToForm,
  formToPayload,
  LANGUAGE_LABELS,
  STEPS,
  DEFAULT_FORM,
} from "@/components/syllabus/types";
import type { SyllabusFormData } from "@/components/syllabus/types";

function lsKey(id: string) {
  return `syllabus_draft_${id}`;
}

function loadDraft(id: string, base: SyllabusFormData): SyllabusFormData {
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(lsKey(id));
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

function saveDraft(id: string, form: SyllabusFormData) {
  localStorage.setItem(lsKey(id), JSON.stringify(form));
}

function clearDraft(id: string) {
  localStorage.removeItem(lsKey(id));
}

export default function EditSyllabusPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SyllabusFormData>(DEFAULT_FORM);
  const [syllabusStatus, setSyllabusStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    getSyllabus(id)
      .then((s) => {
        setSyllabusStatus(s.status);
        const base = syllabusToForm(s);
        // Merge localStorage draft if any
        setForm(loadDraft(id, base));
        setDraftLoaded(true);
      })
      .catch(() => router.replace("/dashboard/syllabuses"))
      .finally(() => setLoading(false));
  }, [id, router]);

  // Save to localStorage on form change
  useEffect(() => {
    if (draftLoaded) saveDraft(id, form);
  }, [form, draftLoaded, id]);

  const update = (updates: Partial<SyllabusFormData>) =>
    setForm((f) => ({ ...f, ...updates }));

  const handleSave = async (andSubmit = false) => {
    setSaving(true);
    setError("");
    try {
      const payload = formToPayload(form);
      await updateSyllabus(id, payload);
      if (andSubmit) {
        await submitForReview(id);
      }
      clearDraft(id);
      router.push(`/dashboard/syllabuses/${id}`);
    } catch {
      setError("Saqlashda xatolik yuz berdi");
      setSaving(false);
    }
  };

  const canSubmit = syllabusStatus === "draft" || syllabusStatus === "rejected";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl pb-12">
      <div className="mb-6">
        <Link
          href={`/dashboard/syllabuses/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={15} /> Ko&apos;rish
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tahrirlash</h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">{form.course_code}</p>
          </div>
          {/* Quick save */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Saqlash
          </button>
        </div>
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
        {step === 6 && <ReviewStep form={form} />}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 items-center">
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

        {step < 6 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
            {canSubmit && (
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Saqlash va yuborish
              </button>
            )}
          </div>
        )}
      </div>

      {showAI && (
        <SyllabusFormAI
          formData={form}
          onApply={update}
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

      {form.description && (
        <ReviewSection title="Tavsif">
          <p className="text-gray-600 leading-relaxed">{form.description.slice(0, 200)}{form.description.length > 200 ? "..." : ""}</p>
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
