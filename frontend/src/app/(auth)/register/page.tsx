"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "@/lib/auth";
import { api } from "@/lib/api";

interface University {
  id: string;
  name: string;
}

const schema = z.object({
  full_name: z.string().min(2, "Ism kamida 2 ta belgi"),
  email: z.string().email("Noto'g'ri email"),
  password: z
    .string()
    .min(8, "Parol kamida 8 ta belgi bo'lishi kerak")
    .regex(/[A-Z]/, "Parolda kamida bitta katta harf bo'lishi kerak")
    .regex(/[0-9]/, "Parolda kamida bitta raqam bo'lishi kerak"),
  confirm_password: z.string(),
  university_id: z.string().min(1, "Universitetni tanlang"),
}).refine((d) => d.password === d.confirm_password, {
  message: "Parollar mos emas",
  path: ["confirm_password"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    api.get<University[]>("/auth/universities")
      .then((r) => setUniversities(r.data))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await registerUser(data.email, data.password, data.full_name, data.university_id);
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Ro'yxatdan o'tishda xatolik. Email allaqachon mavjud bo'lishi mumkin.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900">Muvaffaqiyatli!</h2>
          <p className="text-gray-500 text-sm mt-2">Login sahifasiga yo&apos;naltirilmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Silabus<span className="text-accent-600">.uz</span></h1>
            <p className="text-gray-500 mt-1 text-sm">Yangi hisob yarating</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To&apos;liq ism
              </label>
              <input
                {...register("full_name")}
                placeholder="Ahmadov Jasur"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="example@university.uz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Universitet
              </label>
              <select
                {...register("university_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Universitetni tanlang</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {errors.university_id && (
                <p className="text-red-500 text-xs mt-1">{errors.university_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parol
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parolni tasdiqlang
              </label>
              <input
                {...register("confirm_password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
