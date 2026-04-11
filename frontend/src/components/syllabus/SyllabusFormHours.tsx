import type { SyllabusFormData } from "./types";

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
}

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-center font-mono";
const LABEL = "block text-sm font-medium text-gray-700 mb-1 text-center";

type HoursKey = "lecture_hours" | "practice_hours" | "lab_hours" | "self_study_hours";

const HOUR_FIELDS: { key: HoursKey; label: string; desc: string }[] = [
  { key: "lecture_hours", label: "Ma'ruza", desc: "Auditoriya soati" },
  { key: "practice_hours", label: "Amaliy", desc: "Seminar / amaliy" },
  { key: "lab_hours", label: "Laboratoriya", desc: "Lab. ishi" },
  { key: "self_study_hours", label: "Mustaqil ish", desc: "Uy vazifasi" },
];

export function SyllabusFormHours({ data, onChange }: Props) {
  const total =
    (Number(data.lecture_hours) || 0) +
    (Number(data.practice_hours) || 0) +
    (Number(data.lab_hours) || 0) +
    (Number(data.self_study_hours) || 0);

  const expected = data.credit_hours * 32;
  const matches = total > 0 && total === expected;
  const mismatch = total > 0 && total !== expected;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Kurs uchun haftalik soatlarni kiriting. Agar aniq ma&apos;lumot bo&apos;lmasa, bo&apos;sh qoldiring.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {HOUR_FIELDS.map(({ key, label, desc }) => (
          <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
            <label className={LABEL}>{label}</label>
            <p className="text-xs text-gray-400 mb-2">{desc}</p>
            <input
              type="number"
              min={0}
              max={999}
              value={data[key]}
              onChange={(e) => onChange({ [key]: e.target.value })}
              placeholder="0"
              className={INPUT}
            />
          </div>
        ))}
      </div>

      {/* Total summary */}
      <div className={`rounded-xl p-4 border-2 transition-colors ${
        matches
          ? "border-green-300 bg-green-50"
          : mismatch
          ? "border-orange-300 bg-orange-50"
          : "border-gray-200 bg-gray-50"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Jami: <span className="text-lg font-bold">{total}</span> soat
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.credit_hours} kredit × 32 soat = {expected} soat bo&apos;lishi kerak
            </p>
          </div>
          {total > 0 && (
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              matches
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {matches ? "✓ Mos" : "✗ Mos emas"}
            </span>
          )}
        </div>

        {/* Visual bars */}
        {total > 0 && (
          <div className="mt-4 space-y-2">
            {HOUR_FIELDS.map(({ key, label }) => {
              const h = Number(data[key]) || 0;
              const pct = total > 0 ? (h / total) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-12 text-right">{h} soat</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
