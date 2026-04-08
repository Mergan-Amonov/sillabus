"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { listSyllabuses } from "@/lib/syllabuses";
import type { SyllabusListResponse } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<SyllabusListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSyllabuses(1, 5)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: data?.total ?? 0,
    approved: data?.items.filter((s) => s.status === "approved").length ?? 0,
    pending: data?.items.filter((s) => s.status === "pending_review").length ?? 0,
    rejected: data?.items.filter((s) => s.status === "rejected").length ?? 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bosh sahifa</h1>
        <p className="text-gray-500 text-sm mt-1">Syllabuslaringiz haqida umumiy ma&apos;lumot</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Jami syllabuslar" value={counts.total} icon={<BookOpen size={20} />} color="blue" />
        <StatCard label="Tasdiqlangan" value={counts.approved} icon={<CheckCircle size={20} />} color="green" />
        <StatCard label="Ko'rib chiqilmoqda" value={counts.pending} icon={<Clock size={20} />} color="yellow" />
        <StatCard label="Rad etilgan" value={counts.rejected} icon={<XCircle size={20} />} color="red" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">So&apos;nggi syllabuslar</h2>
          <Link href="/dashboard/syllabuses" className="text-sm text-blue-600 hover:underline">
            Hammasini ko&apos;rish
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Hali syllabus yo&apos;q</p>
            <Link
              href="/dashboard/syllabuses/new"
              className="inline-block mt-3 text-sm text-blue-600 hover:underline"
            >
              Yangi syllabus yarating
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/syllabuses/${s.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.course_code} · {s.credit_hours} kredit</p>
                </div>
                <StatusDot status={s.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-400",
    pending_review: "bg-yellow-400",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    archived: "bg-gray-300",
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] ?? "bg-gray-300"}`} />;
}
