"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSyllabus, updateSyllabus } from "@/lib/syllabuses";

const schema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  credit_hours: z.number({ invalid_type_error: "Son kiriting" }).min(1).max(10),
  description: z.string().optional(),
  objectives: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditSyllabusPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getSyllabus(id)
      .then((s) => {
        reset({
          title: s.title,
          credit_hours: s.credit_hours,
          description: s.description ?? "",
          objectives: s.objectives ?? "",
        });
      })
      .catch(() => router.replace("/dashboard/syllabuses"))
      .finally(() => setLoading(false));
  }, [id, reset, router]);

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await updateSyllabus(id, data);
      router.replace(`/dashboard/syllabuses/${id}`);
    } catch {
      setError("Yangilashda xatolik yuz berdi");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/dashboard/syllabuses/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Orqaga
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Syllabusni tahrirlash</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kredit soatlari <span className="text-red-500">*</span>
            </label>
            <input
              {...register("credit_hours", { valueAsNumber: true })}
              type="number"
              min={1}
              max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.credit_hours && (
              <p className="text-red-500 text-xs mt-1">{errors.credit_hours.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maqsadlar</label>
            <textarea
              {...register("objectives")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href={`/dashboard/syllabuses/${id}`}
            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}
