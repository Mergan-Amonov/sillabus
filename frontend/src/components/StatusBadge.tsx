import type { SyllabusStatus } from "@/types";

const config: Record<SyllabusStatus, { label: string; className: string }> = {
  draft: { label: "Qoralama", className: "bg-gray-100 text-gray-700" },
  pending_review: { label: "Ko'rib chiqilmoqda", className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Tasdiqlangan", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rad etilgan", className: "bg-red-100 text-red-700" },
  archived: { label: "Arxivlangan", className: "bg-gray-200 text-gray-600" },
};

export function StatusBadge({ status }: { status: SyllabusStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
