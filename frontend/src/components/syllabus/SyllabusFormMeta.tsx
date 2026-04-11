"use client";
import type { SyllabusFormData, ReviewerInfo, ApprovalInfo } from "./types";

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
}

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const LABEL = "block text-sm font-medium text-gray-700 mb-1";

function ReviewerBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ReviewerInfo;
  onChange: (v: ReviewerInfo) => void;
}) {
  const set = (k: keyof ReviewerInfo, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div>
        <label className={LABEL}>Ismi sha&apos;rifi</label>
        <input value={value.name} onChange={(e) => set("name", e.target.value)}
          placeholder="Rustamov H.Sh." className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>Lavozim</label>
        <input value={value.title} onChange={(e) => set("title", e.target.value)}
          placeholder="Kafedra dotsenti, p.f.f.d." className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>Tashkilot</label>
        <input value={value.org} onChange={(e) => set("org", e.target.value)}
          placeholder="Buxoro davlat universiteti" className={INPUT} />
      </div>
    </div>
  );
}

export function SyllabusFormMeta({ data, onChange }: Props) {
  const setR1 = (v: ReviewerInfo) => onChange({ reviewer_1: v });
  const setR2 = (v: ReviewerInfo) => onChange({ reviewer_2: v });
  const setAp = (patch: Partial<ApprovalInfo>) =>
    onChange({ approval_info: { ...data.approval_info, ...patch } });

  return (
    <div className="space-y-7">
      {/* Tuzuvchi */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Tuzuvchi ma&apos;lumotlari</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Telefon raqam</label>
            <input
              value={data.instructor_phone}
              onChange={(e) => onChange({ instructor_phone: e.target.value })}
              placeholder="+998 99 123 45 67"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Erkin qabul kuni</label>
            <input
              value={data.office_hours}
              onChange={(e) => onChange({ office_hours: e.target.value })}
              placeholder="Payshanba, 14:00–18:00"
              className={INPUT}
            />
          </div>
        </div>
      </div>

      {/* Taqrizchilar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Taqrizchilar</h3>
        <div className="space-y-3">
          <ReviewerBlock label="Taqrizchi 1" value={data.reviewer_1} onChange={setR1} />
          <ReviewerBlock label="Taqrizchi 2" value={data.reviewer_2} onChange={setR2} />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Ixtiyoriy. Ko&apos;rsatilmasa PDF da bo&apos;sh chiziq qoladi.
        </p>
      </div>

      {/* Tasdiqlash */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Tasdiqlash bloki</h3>
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className={LABEL}>Prorektor / Dekan ismi</label>
            <input
              value={data.approval_info.approver_name}
              onChange={(e) => setAp({ approver_name: e.target.value })}
              placeholder="A.T. Absalamov"
              className={INPUT}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Tasdiqlash sanasi</label>
              <input
                type="date"
                value={data.approval_info.date}
                onChange={(e) => setAp({ date: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Kengash sanasi</label>
              <input
                type="date"
                value={data.approval_info.council_date}
                onChange={(e) => setAp({ council_date: e.target.value })}
                className={INPUT}
              />
            </div>
          </div>
          <div>
            <label className={LABEL}>Majlis raqami</label>
            <input
              value={data.approval_info.council_number}
              onChange={(e) => setAp({ council_number: e.target.value })}
              placeholder="12"
              className={INPUT + " w-32"}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Ixtiyoriy. PDF da prorektor imzo blokida ko&apos;rinadi.
        </p>
      </div>
    </div>
  );
}
