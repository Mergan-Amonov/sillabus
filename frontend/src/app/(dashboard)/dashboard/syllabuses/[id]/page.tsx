"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Edit2, Send, Trash2, X, CheckCircle, XCircle,
} from "lucide-react";
import {
  getSyllabus, submitForReview, reviewSyllabus, deleteSyllabus,
} from "@/lib/syllabuses";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuthStore } from "@/hooks/useAuth";
import type { Syllabus, SyllabusStatus, WeekEntry } from "@/types";

const LANG_LABELS: Record<string, string> = {
  uzbek: "O'zbek", russian: "Русский", english: "English",
};

type Tab = "umumiy" | "jadval" | "baholash" | "adabiyotlar" | "natijalar";

const TABS: { key: Tab; label: string }[] = [
  { key: "umumiy", label: "Umumiy" },
  { key: "jadval", label: "Jadval" },
  { key: "baholash", label: "Baholash" },
  { key: "adabiyotlar", label: "Adabiyotlar" },
  { key: "natijalar", label: "Natijalar" },
];

export default function SyllabusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("umumiy");

  useEffect(() => {
    getSyllabus(id)
      .then(setSyllabus)
      .catch(() => router.replace("/dashboard/syllabuses"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      const updated = await submitForReview(id);
      setSyllabus(updated);
    } catch {
      setError("Ko'rib chiqishga yuborishda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async (action: "approve" | "reject") => {
    setActionLoading(true);
    try {
      const updated = await reviewSyllabus(id, action, reviewComment || undefined);
      setSyllabus(updated);
      setShowReview(false);
    } catch {
      setError("Ko'rib chiqishda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!syllabus) return;
    setActionLoading(true);
    try {
      const response = await api.get(`/export/${id}/${format}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const ext = format === "pdf" ? "pdf" : "docx";
      link.setAttribute("download", `${syllabus.course_code}_${syllabus.title.slice(0, 30).replace(/\s+/g, "_")}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      if (axiosErr?.response?.status === 403) {
        setError("Eksport uchun ruxsat yo'q. Faqat tasdiqlangan yoki ko'rib chiqilayotgan syllabuslar eksport qilinishi mumkin.");
      } else {
        setError("Eksport qilishda xatolik yuz berdi");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    setActionLoading(true);
    try {
      await deleteSyllabus(id);
      router.replace("/dashboard/syllabuses");
    } catch {
      setError("O'chirishda xatolik");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!syllabus) return null;

  const isOwner = syllabus.created_by === user?.id;
  const canReview = user?.role === "reviewer" || user?.role === "university_admin" || user?.role === "super_admin";
  const canSubmit = isOwner && (syllabus.status === "draft" || syllabus.status === "rejected");
  const canReviewAction = canReview && syllabus.status === "pending_review";
  const canDelete = isOwner && (syllabus.status === "draft" || syllabus.status === "rejected");
  const canEdit = isOwner && (syllabus.status === "draft" || syllabus.status === "rejected");
  const canExport =
    syllabus.status === "approved" ||
    syllabus.status === "pending_review" ||
    (isOwner && user?.role === "teacher");

  return (
    <div className="max-w-4xl pb-12">
      {/* Page header */}
      <div className="mb-6">
        <Link href="/dashboard/syllabuses" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} /> Orqaga
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{syllabus.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {syllabus.course_code} · {syllabus.credit_hours} kredit
              {syllabus.department && ` · ${syllabus.department}`}
            </p>
          </div>
          <StatusBadge status={syllabus.status as SyllabusStatus} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Review comment */}
      {syllabus.review_comment && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Ko&apos;rib chiquvchi izohi:</p>
          <p className="text-sm text-amber-700">{syllabus.review_comment}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {canEdit && (
          <Link href={`/dashboard/syllabuses/${id}/edit`}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Edit2 size={14} /> Tahrirlash
          </Link>
        )}
        {canSubmit && (
          <button onClick={handleSubmit} disabled={actionLoading}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            <Send size={14} /> Ko&apos;rib chiqishga yuborish
          </button>
        )}
        {canReviewAction && !showReview && (
          <button onClick={() => setShowReview(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            Ko&apos;rib chiqish
          </button>
        )}
        {canExport && (
          <>
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Download size={14} /> PDF
            </button>
            <button
              type="button"
              onClick={() => handleExport("docx")}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Download size={14} /> DOCX
            </button>
          </>
        )}
        {canDelete && (
          <button onClick={handleDelete} disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
            <Trash2 size={14} /> O&apos;chirish
          </button>
        )}
      </div>

      {/* Review panel */}
      {showReview && (
        <div className="mb-5 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-3">Ko&apos;rib chiqish</h2>
          <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Izoh (ixtiyoriy)..." rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4" />
          <div className="flex gap-3">
            <button onClick={() => handleReview("approve")} disabled={actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
              <CheckCircle size={14} /> Tasdiqlash
            </button>
            <button onClick={() => handleReview("reject")} disabled={actionLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
              <XCircle size={14} /> Rad etish
            </button>
            <button onClick={() => setShowReview(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Bekor
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {activeTab === "umumiy" && <TabUmumiy syllabus={syllabus} />}
        {activeTab === "jadval" && <TabJadval syllabus={syllabus} />}
        {activeTab === "baholash" && <TabBaholash syllabus={syllabus} />}
        {activeTab === "adabiyotlar" && <TabAdabiyotlar syllabus={syllabus} />}
        {activeTab === "natijalar" && <TabNatijalar syllabus={syllabus} />}
      </div>

      {/* Footer dates */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
        <span>Yaratilgan: {new Date(syllabus.created_at).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })}</span>
        {syllabus.reviewed_at && (
          <span>Ko&apos;rib chiqilgan: {new Date(syllabus.reviewed_at).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })}</span>
        )}
      </div>
    </div>
  );
}

// ── Tab: Umumiy ─────────────────────────────────────────────────────────────

function TabUmumiy({ syllabus }: { syllabus: Syllabus }) {
  const rows: [string, string | null | undefined][] = [
    ["Fan kodi", syllabus.course_code],
    ["Kredit soat", `${syllabus.credit_hours} soat`],
    ["Semestr", syllabus.semester ? `${syllabus.semester}-semestr` : null],
    ["O'quv yili", syllabus.academic_year],
    ["Kafedra", syllabus.department],
    ["Fakultet", syllabus.faculty],
    ["Mutaxassislik", syllabus.specialization],
    ["O'qitish tili", syllabus.language ? (LANG_LABELS[syllabus.language] ?? syllabus.language) : null],
    ["Prerekvizitlar", syllabus.prerequisites],
    ["O'tish bali", syllabus.passing_grade ? `${syllabus.passing_grade} ball` : null],
  ].filter(([, v]) => v) as [string, string][];

  const lh = syllabus.lecture_hours ?? 0;
  const ph = syllabus.practice_hours ?? 0;
  const lbh = syllabus.lab_hours ?? 0;
  const ssh = syllabus.self_study_hours ?? 0;
  const totalH = lh + ph + lbh + ssh;
  const hasHours = totalH > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Meta table */}
      <div>
        <SectionTitle title="Kurs ma'lumotlari" />
        <div className="divide-y divide-gray-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex py-2.5">
              <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
              <span className="text-sm text-gray-900 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hours bars */}
      {hasHours && (
        <div>
          <SectionTitle title="Soatlar taqsimoti" />
          <div className="space-y-3 mt-2">
            {([
              ["Ma'ruza", lh],
              ["Amaliy", ph],
              ["Laboratoriya", lbh],
              ["Mustaqil ish", ssh],
            ] as [string, number][]).map(([label, hours]) => (
              <HourBar key={label} label={label} hours={hours} total={totalH} />
            ))}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-2">
              <span className="text-sm text-gray-500 w-28 shrink-0">Jami</span>
              <span className="text-sm font-bold text-gray-900">{totalH} soat</span>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {syllabus.description && (
        <div>
          <SectionTitle title="Kurs tavsifi" />
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-1">
            {syllabus.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Jadval ──────────────────────────────────────────────────────────────

function TabJadval({ syllabus }: { syllabus: Syllabus }) {
  const weeks = (syllabus.content?.weeks ?? []) as WeekEntry[];

  if (weeks.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Haftalik jadval mavjud emas.
        {syllabus.status === "draft" && (
          <Link href={`/dashboard/syllabuses/${syllabus.id}/edit`}
            className="block mt-2 text-primary-600 hover:underline font-medium">
            Tahrirlashda AI orqali to&apos;ldirish
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary-600 text-white">
            {["#", "Mavzu", "Ma'ruza", "Amaliy", "Mustaqil ish"].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide first:w-10">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => {
            const practice = w.practice_content ?? (Array.isArray(w.activities) ? w.activities.join(", ") : (w.activities ?? ""));
            return (
              <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-3 text-center text-gray-400 text-xs font-medium">{w.week}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{w.topic}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{w.lecture_content ?? w.description ?? ""}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{practice}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{w.self_study ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab: Baholash ────────────────────────────────────────────────────────────

const GRADING_LABELS: Record<string, string> = {
  current_control: "Joriy nazorat",
  midterm: "Oraliq imtihon",
  final: "Yakuniy imtihon",
};

const GRADING_COLORS = ["bg-primary-500", "bg-purple-500", "bg-indigo-600"];

function TabBaholash({ syllabus }: { syllabus: Syllabus }) {
  const gp = syllabus.grading_policy;

  if (!gp) {
    return <div className="p-8 text-center text-sm text-gray-400">Baholash ma&apos;lumotlari mavjud emas.</div>;
  }

  const entries = Object.entries(gp);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="p-6 space-y-6">
      <SectionTitle title="Baholash taqsimoti" />

      {/* Visual bars */}
      <div className="space-y-3">
        {entries.map(([key, val], i) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">{GRADING_LABELS[key] ?? key}</span>
              <span className="text-sm font-bold text-gray-900">{val}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${GRADING_COLORS[i % GRADING_COLORS.length]} rounded-full transition-all`}
                style={{ width: total > 0 ? `${(val / total) * 100}%` : "0%" }}
              />
            </div>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-gray-100 text-sm">
          <span className="text-gray-500">Jami</span>
          <span className={`font-bold ${total === 100 ? "text-green-600" : "text-red-500"}`}>
            {total}%
          </span>
        </div>
      </div>

      {/* Passing grade + attendance */}
      {syllabus.passing_grade !== null && (
        <div className="bg-primary-50 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-700">{syllabus.passing_grade}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">O&apos;tish bali</p>
            <p className="text-xs text-gray-500">{syllabus.passing_grade} ball va yuqori — o&apos;tgan hisoblanadi</p>
          </div>
        </div>
      )}

      {syllabus.attendance_policy && (
        <div>
          <SectionTitle title="Davomat talablari" />
          <p className="text-sm text-gray-700 leading-relaxed mt-1">{syllabus.attendance_policy}</p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Adabiyotlar ─────────────────────────────────────────────────────────

function TabAdabiyotlar({ syllabus }: { syllabus: Syllabus }) {
  const books = syllabus.textbooks ?? [];
  const resources = syllabus.online_resources ?? [];

  if (books.length === 0 && resources.length === 0) {
    return <div className="p-8 text-center text-sm text-gray-400">Adabiyotlar mavjud emas.</div>;
  }

  const required = books.filter((b) => b.required);
  const optional = books.filter((b) => !b.required);

  return (
    <div className="p-6 space-y-6">
      {required.length > 0 && (
        <div>
          <SectionTitle title="Asosiy adabiyotlar" />
          <ol className="space-y-2 mt-2">
            {required.map((book, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="text-gray-400 shrink-0 w-5 text-right">{i + 1}.</span>
                <span>
                  <span className="font-medium text-gray-900">{book.title}</span>
                  {book.author && <span className="text-gray-500"> — {book.author}</span>}
                  {(book.publisher || book.year) && (
                    <span className="text-gray-400"> · {[book.publisher, book.year].filter(Boolean).join(", ")}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {optional.length > 0 && (
        <div>
          <SectionTitle title="Qo'shimcha adabiyotlar" />
          <ul className="space-y-2 mt-2">
            {optional.map((book, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="text-gray-400 shrink-0">•</span>
                <span>
                  <span className="font-medium text-gray-900">{book.title}</span>
                  {book.author && <span className="text-gray-500"> — {book.author}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resources.length > 0 && (
        <div>
          <SectionTitle title="Onlayn resurslar" />
          <ul className="space-y-3 mt-2">
            {resources.map((r, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-primary-500 shrink-0 mt-0.5">•</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.name}</p>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline break-all">
                      {r.url}
                    </a>
                  )}
                  {r.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Tab: Natijalar ───────────────────────────────────────────────────────────

function TabNatijalar({ syllabus }: { syllabus: Syllabus }) {
  const outcomes = syllabus.learning_outcomes ?? [];
  const competencies = syllabus.competencies ?? [];

  if (outcomes.length === 0 && competencies.length === 0) {
    return <div className="p-8 text-center text-sm text-gray-400">O&apos;quv natijalari mavjud emas.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {outcomes.length > 0 && (
        <div>
          <SectionTitle title="O'quv natijalari" />
          <ul className="mt-2 space-y-2">
            {outcomes.map((o, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-700 pt-0.5">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {competencies.length > 0 && (
        <div>
          <SectionTitle title="Kompetensiyalar" />
          <div className="mt-2 flex flex-wrap gap-2">
            {competencies.map((c, i) => (
              <span key={i}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-200 font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared components ────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100 mb-3">
      {title}
    </h3>
  );
}

function HourBar({ label, hours, total }: { label: string; hours: number; total: number }) {
  const pct = total > 0 ? (hours / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${hours > 0 ? "bg-primary-500" : "bg-gray-200"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-16 text-right">
        {hours > 0 ? `${hours} soat` : "—"}
      </span>
    </div>
  );
}
