"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { createSyllabus, generateAI } from "@/lib/syllabuses";

const schema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  course_code: z.string().min(2, "Kurs kodi kamida 2 ta belgi"),
  credit_hours: z.number({ invalid_type_error: "Son kiriting" }).min(1).max(10),
  description: z.string().optional(),
  objectives: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewSyllabusPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { credit_hours: 3 },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const syllabus = await createSyllabus({
        ...data,
        content: aiResult ?? undefined,
      });
      router.replace(`/dashboard/syllabuses/${syllabus.id}`);
    } catch {
      setError("Syllabus yaratishda xatolik yuz berdi");
    }
  };

  const handleAI = async () => {
    const title = watch("title");
    const code = watch("course_code");
    const credits = watch("credit_hours");
    if (!title || !code) {
      setError("AI uchun sarlavha va kurs kodini kiriting");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await generateAI({
        course_title: title,
        course_code: code,
        credit_hours: credits || 3,
      });
      setAiResult(res.generated);
    } catch {
      setError("AI generatsiyada xatolik");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard/syllabuses"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Orqaga
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Yangi syllabus</h1>
        <p className="text-gray-500 text-sm mt-1">Yangi kurs syllabus yarating</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Asosiy ma&apos;lumotlar</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="Masalan: Dasturlash asoslari"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kurs kodi <span className="text-red-500">*</span>
              </label>
              <input
                {...register("course_code")}
                placeholder="CS101"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.course_code && (
                <p className="text-red-500 text-xs mt-1">{errors.course_code.message}</p>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Kurs haqida qisqacha tavsif..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maqsadlar</label>
            <textarea
              {...register("objectives")}
              rows={3}
              placeholder="Kurs maqsadlari..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">AI bilan yarating</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sarlavha va kurs kodini kiritib, AI yordam so&apos;rang</p>
            </div>
            <button
              type="button"
              onClick={handleAI}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={16} />
              {aiLoading ? "Yuklanmoqda..." : "AI yaratsin"}
            </button>
          </div>

          {aiResult && (
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-medium text-purple-700 mb-2">AI tomonidan yaratilgan kontent:</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-48">
                {JSON.stringify(aiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/dashboard/syllabuses"
            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saqlanmoqda..." : "Syllabus yaratish"}
          </button>
        </div>
      </form>
    </div>
  );
}
