"use client";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import type { SyllabusFormData } from "./types";

interface WeekEntry {
  week: number;
  topic: string;
  subtopics: string[];
  lecture_hours: number;
  practice_hours: number;
}

interface SelfStudyEntry {
  topic: string;
  task: string;
  hours: number;
}

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
  onAI: () => void;
}

const WEEK_COUNT = 15;

const DEFAULT_WEEK = (n: number): WeekEntry => ({
  week: n,
  topic: "",
  subtopics: [],
  lecture_hours: 2,
  practice_hours: 2,
});

const DEFAULT_SELF_STUDY = (): SelfStudyEntry[] =>
  Array.from({ length: 6 }, () => ({ topic: "", task: "", hours: 6 }));

function normalizeWeek(w: Record<string, unknown>, fallbackIdx: number): WeekEntry {
  // Handle both manual form shape and AI-generated shape:
  // AI: { week, topic, lecture_content, practice_content, self_study, hours: { lecture, practice } }
  // Form: { week, topic, subtopics[], lecture_hours, practice_hours }
  const aiHours = w.hours as { lecture?: number; practice?: number } | undefined;
  return {
    week: (w.week as number) ?? fallbackIdx + 1,
    topic: (w.topic as string) ?? "",
    subtopics: Array.isArray(w.subtopics)
      ? (w.subtopics as string[])
      : [w.lecture_content, w.practice_content].filter(Boolean) as string[],
    lecture_hours: typeof w.lecture_hours === "number"
      ? w.lecture_hours
      : (aiHours?.lecture ?? 2),
    practice_hours: typeof w.practice_hours === "number"
      ? w.practice_hours
      : (aiHours?.practice ?? 2),
  };
}

function getWeeks(content: Record<string, unknown>): WeekEntry[] {
  const raw = content?.weeks;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((w, i) => normalizeWeek(w as Record<string, unknown>, i));
  }
  return Array.from({ length: WEEK_COUNT }, (_, i) => DEFAULT_WEEK(i + 1));
}

function getSelfStudy(content: Record<string, unknown>): SelfStudyEntry[] {
  const raw = content?.self_study;
  if (Array.isArray(raw) && raw.length > 0) return raw as SelfStudyEntry[];
  return DEFAULT_SELF_STUDY();
}

const INPUT = "px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const NUM_INPUT = INPUT + " w-14 text-center font-mono";

export function SyllabusFormWeekly({ data, onChange, onAI }: Props) {
  const content = (data.content ?? {}) as Record<string, unknown>;
  const weeks = getWeeks(content);
  const selfStudy = getSelfStudy(content);

  const setContent = (patch: Partial<{ weeks: WeekEntry[]; self_study: SelfStudyEntry[] }>) => {
    onChange({ content: { ...content, ...patch } });
  };

  // --- Week editing ---
  const updateWeek = (i: number, patch: Partial<WeekEntry>) => {
    const next = [...weeks];
    next[i] = { ...next[i], ...patch };
    setContent({ weeks: next });
  };

  const updateSubtopics = (i: number, raw: string) => {
    const subs = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    updateWeek(i, { subtopics: subs });
  };

  // --- Self-study editing ---
  const updateSS = (i: number, patch: Partial<SelfStudyEntry>) => {
    const next = [...selfStudy];
    next[i] = { ...next[i], ...patch };
    setContent({ self_study: next });
  };

  const addSSRow = () => setContent({ self_study: [...selfStudy, { topic: "", task: "", hours: 6 }] });
  const removeSSRow = (i: number) => setContent({ self_study: selfStudy.filter((_, idx) => idx !== i) });

  const hasWeekData = weeks.some((w) => w.topic.trim());

  return (
    <div className="space-y-8">
      {/* AI button */}
      <div className="flex items-center justify-between">
        <div>
          {!hasWeekData && (
            <p className="text-sm text-gray-500">
              Bo&apos;sh jadval. AI yordamida to&apos;ldiring yoki qo&apos;lda kiriting.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onAI}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Sparkles size={15} />
          AI yordamida to&apos;ldirish
        </button>
      </div>

      {/* Weekly schedule table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Ma&apos;ruza va amaliy mashg&apos;ulotlari rejasi
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 w-10">№</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[160px]">Mavzu</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[200px]">Dars mazmuni</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 w-16">Ma&apos;ruza</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 w-16">Amaliy</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 w-14">Jami</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => {
                const total = (w.lecture_hours || 0) + (w.practice_hours || 0);
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-center text-xs text-gray-400 font-mono">{w.week}</td>
                    <td className="px-2 py-2">
                      <input
                        value={w.topic}
                        onChange={(e) => updateWeek(i, { topic: e.target.value })}
                        placeholder={`${w.week}-hafta mavzusi`}
                        className={INPUT + " w-full"}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <textarea
                        value={w.subtopics.join("\n")}
                        onChange={(e) => updateSubtopics(i, e.target.value)}
                        placeholder={"• Birinchi kichik mavzu\n• Ikkinchi kichik mavzu"}
                        rows={2}
                        className={INPUT + " w-full resize-none text-xs leading-relaxed"}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={w.lecture_hours}
                        onChange={(e) => updateWeek(i, { lecture_hours: Number(e.target.value) })}
                        className={NUM_INPUT}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={w.practice_hours}
                        onChange={(e) => updateWeek(i, { practice_hours: Number(e.target.value) })}
                        className={NUM_INPUT}
                      />
                    </td>
                    <td className="px-3 py-2 text-center text-sm font-semibold text-gray-700">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-gray-500">Jami</td>
                <td className="px-3 py-2 text-center text-sm font-bold text-gray-800">
                  {weeks.reduce((s, w) => s + (w.lecture_hours || 0), 0)}
                </td>
                <td className="px-3 py-2 text-center text-sm font-bold text-gray-800">
                  {weeks.reduce((s, w) => s + (w.practice_hours || 0), 0)}
                </td>
                <td className="px-3 py-2 text-center text-sm font-bold text-primary-700">
                  {weeks.reduce((s, w) => s + (w.lecture_hours || 0) + (w.practice_hours || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Self-study plan */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Mustaqil ta&apos;lim mashg&apos;ulotlari rejasi</h3>
        <p className="text-xs text-gray-500 mb-3">
          Talaba mustaqil bajaradigan topshiriqlar va soat hajmi.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[160px]">Mavzu</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 min-w-[200px]">Topshiriq</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 w-16">Soat</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {selfStudy.map((ss, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-2 py-2">
                    <input
                      value={ss.topic}
                      onChange={(e) => updateSS(i, { topic: e.target.value })}
                      placeholder="Mavzu nomi"
                      className={INPUT + " w-full"}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={ss.task}
                      onChange={(e) => updateSS(i, { task: e.target.value })}
                      placeholder="Nazariy o'rganish + amaliy mashq"
                      className={INPUT + " w-full"}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={ss.hours}
                      onChange={(e) => updateSS(i, { hours: Number(e.target.value) })}
                      className={NUM_INPUT}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeSSRow(i)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-gray-500">Jami</td>
                <td className="px-3 py-2 text-center text-sm font-bold text-primary-700">
                  {selfStudy.reduce((s, ss) => s + (ss.hours || 0), 0)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <button
          type="button"
          onClick={addSSRow}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <Plus size={13} /> Qator qo&apos;shish
        </button>
      </div>
    </div>
  );
}
