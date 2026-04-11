import type { GradingPolicy } from "@/types";
import type { SyllabusFormData } from "./types";

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
}

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

type GPKey = keyof SyllabusFormData["grading_policy"];

const GRADING_FIELDS: { key: GPKey; label: string; color: string }[] = [
  { key: "current_control", label: "Joriy nazorat", color: "bg-primary-500" },
  { key: "midterm", label: "Oraliq imtihon", color: "bg-purple-500" },
  { key: "final", label: "Yakuniy imtihon", color: "bg-indigo-600" },
];

export function SyllabusFormGrading({ data, onChange }: Props) {
  const gp = data.grading_policy;
  const total = gp.current_control + gp.midterm + gp.final;
  const isValid = total === 100;

  const setGP = (key: GPKey, val: number) =>
    onChange({ grading_policy: { ...gp, [key]: Math.max(0, Math.min(100, val)) } });

  return (
    <div className="space-y-6">
      {/* Grading sliders */}
      <div className="space-y-4">
        {GRADING_FIELDS.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={gp[key]}
                  onChange={(e) => setGP(key, Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full">
              <div
                className={`h-full ${color} rounded-full transition-all`}
                style={{ width: `${gp[key]}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={gp[key]}
                onChange={(e) => setGP(key, Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total indicator */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${
        isValid ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
      }`}>
        <span className="text-sm font-medium text-gray-700">Jami</span>
        <span className={`text-lg font-bold ${isValid ? "text-green-700" : "text-red-600"}`}>
          {total}% {isValid ? "✓" : "✗ (100% bo'lishi kerak)"}
        </span>
      </div>

      {/* Passing grade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          O&apos;tish bali
          <span className="text-xs text-gray-400 font-normal ml-2">(100 ballik tizimda)</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={100}
            value={data.passing_grade}
            onChange={(e) => onChange({ passing_grade: e.target.value })}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-500">ball va undan yuqori — o'tgan hisoblanadi</span>
        </div>
      </div>

      {/* Attendance policy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Davomat talablari</label>
        <textarea
          value={data.attendance_policy}
          onChange={(e) => onChange({ attendance_policy: e.target.value })}
          rows={3}
          placeholder="Kamida 80% davomat talab qilinadi. 3 dan ortiq sababsiz qolinish..."
          className={INPUT + " resize-none"}
        />
      </div>
    </div>
  );
}
