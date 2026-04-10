import { Sparkles } from "lucide-react";
import type { SyllabusFormData } from "./types";
import { LANGUAGE_LABELS } from "./types";
import type { SyllabusLanguage } from "@/types";

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
  onAI: () => void;
}

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const LABEL = "block text-sm font-medium text-gray-700 mb-1";

export function SyllabusFormBasic({ data, onChange, onAI }: Props) {
  return (
    <div className="space-y-5">
      {/* AI button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAI}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Sparkles size={15} />
          AI yordamida to&apos;ldirish
        </button>
      </div>

      {/* Title */}
      <div>
        <label className={LABEL}>
          Fan nomi <span className="text-red-500">*</span>
        </label>
        <input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Masalan: Dasturlash asoslari"
          className={INPUT}
        />
      </div>

      {/* Course code + credit hours */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>
            Fan kodi <span className="text-red-500">*</span>
          </label>
          <input
            value={data.course_code}
            onChange={(e) => onChange({ course_code: e.target.value.toUpperCase() })}
            placeholder="CS101"
            className={INPUT + " font-mono"}
          />
        </div>
        <div>
          <label className={LABEL}>
            Kredit soat <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={data.credit_hours}
            onChange={(e) => onChange({ credit_hours: Math.max(1, Math.min(10, Number(e.target.value))) })}
            className={INPUT}
          />
        </div>
      </div>

      {/* Department + Faculty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Kafedra</label>
          <input
            value={data.department}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="Kompyuter fanlari"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Fakultet</label>
          <input
            value={data.faculty}
            onChange={(e) => onChange({ faculty: e.target.value })}
            placeholder="Axborot texnologiyalari"
            className={INPUT}
          />
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label className={LABEL}>Mutaxassislik</label>
        <input
          value={data.specialization}
          onChange={(e) => onChange({ specialization: e.target.value })}
          placeholder="Dasturiy injiniring"
          className={INPUT}
        />
      </div>

      {/* Academic year + Semester + Language */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>O&apos;quv yili</label>
          <input
            value={data.academic_year}
            onChange={(e) => onChange({ academic_year: e.target.value })}
            placeholder="2024-2025"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Semestr</label>
          <select
            value={data.semester}
            onChange={(e) => onChange({ semester: Number(e.target.value) as 1 | 2 })}
            className={INPUT}
          >
            <option value={1}>1-semestr</option>
            <option value={2}>2-semestr</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Til</label>
          <select
            value={data.language}
            onChange={(e) => onChange({ language: e.target.value as SyllabusLanguage })}
            className={INPUT}
          >
            {(Object.entries(LANGUAGE_LABELS) as [SyllabusLanguage, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={LABEL}>Kurs tavsifi</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder="Kurs haqida qisqacha ma'lumot..."
          className={INPUT + " resize-none"}
        />
      </div>

      {/* Prerequisites */}
      <div>
        <label className={LABEL}>Prerekvizitlar</label>
        <textarea
          value={data.prerequisites}
          onChange={(e) => onChange({ prerequisites: e.target.value })}
          rows={2}
          placeholder="Matematika I, Fizika asoslari..."
          className={INPUT + " resize-none"}
        />
      </div>
    </div>
  );
}
