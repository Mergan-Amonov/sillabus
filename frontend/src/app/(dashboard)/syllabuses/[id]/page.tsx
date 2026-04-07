"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Edit2, Send, Trash2, X } from "lucide-react";
import {
  getSyllabus,
  submitForReview,
  reviewSyllabus,
  deleteSyllabus,
  exportUrl,
} from "@/lib/syllabuses";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuthStore } from "@/hooks/useAuth";
import type { Syllabus, SyllabusStatus } from "@/types";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!syllabus) return null;

  const isOwner = syllabus.created_by === user?.id;
  const canReview = user?.role === "reviewer" || user?.role === "university_admin" || user?.role === "super_admin";
  const canSubmit = isOwner && syllabus.status === "draft";
  const canReviewAction = canReview && syllabus.status === "pending_review";
  const canDelete = isOwner && (syllabus.status === "draft" || syllabus.status === "rejected");
  const canEdit = isOwner && (syllabus.status === "draft" || syllabus.status === "rejected");

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/dashboard/syllabuses"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Orqaga
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{syllabus.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {syllabus.course_code} · {syllabus.credit_hours} kredit soat
            </p>
          </div>
          <StatusBadge status={syllabus.status as SyllabusStatus} />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {syllabus.review_comment && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Ko&apos;rib chiquvchi izohi:</p>
          <p className="text-sm text-amber-700">{syllabus.review_comment}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Ma&apos;lumotlar</h2>

        {syllabus.description && (
          <InfoRow label="Tavsif" value={syllabus.description} />
        )}
        {syllabus.objectives && (
          <InfoRow label="Maqsadlar" value={syllabus.objectives} />
        )}
        <InfoRow
          label="Yaratilgan sana"
          value={new Date(syllabus.created_at).toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
        {syllabus.reviewed_at && (
          <InfoRow
            label="Ko'rib chiqilgan sana"
            value={new Date(syllabus.reviewed_at).toLocaleDateString("uz-UZ", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        )}
      </div>

      {syllabus.content && Object.keys(syllabus.content).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">AI Kontent</h2>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-60 bg-gray-50 p-3 rounded-lg">
            {JSON.stringify(syllabus.content, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canEdit && (
          <Link
            href={`/dashboard/syllabuses/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={16} />
            Tahrirlash
          </Link>
        )}

        {canSubmit && (
          <button
            onClick={handleSubmit}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
            Ko&apos;rib chiqishga yuborish
          </button>
        )}

        {canReviewAction && !showReview && (
          <button
            onClick={() => setShowReview(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Ko&apos;rib chiqish
          </button>
        )}

        <a
          href={exportUrl(id, "pdf")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          PDF
        </a>
        <a
          href={exportUrl(id, "docx")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          DOCX
        </a>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            O&apos;chirish
          </button>
        )}
      </div>

      {showReview && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Ko&apos;rib chiqish</h2>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Izoh (ixtiyoriy)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleReview("approve")}
              disabled={actionLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Tasdiqlash
            </button>
            <button
              onClick={() => handleReview("reject")}
              disabled={actionLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Rad etish
            </button>
            <button
              onClick={() => setShowReview(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Bekor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
