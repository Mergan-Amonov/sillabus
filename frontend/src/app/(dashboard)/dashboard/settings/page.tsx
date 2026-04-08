"use client";
import { useState } from "react";
import { Eye, EyeOff, Key, Trash2 } from "lucide-react";
import { updateApiKey } from "@/lib/auth";
import { useAuthStore } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateApiKey(apiKey.trim());
      setUser(updated);
      setApiKey("");
      setSuccess("API kalit muvaffaqiyatli saqlandi!");
    } catch {
      setError("Saqlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("API kalitni o'chirmoqchimisiz?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateApiKey(null);
      setUser(updated);
      setSuccess("API kalit o'chirildi.");
    } catch {
      setError("O'chirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-gray-500 text-sm mt-1">Shaxsiy sozlamalaringiz</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Key size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">OpenAI API Kalit</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              AI syllabus generatsiyasi uchun shaxsiy kalitingiz
            </p>
          </div>
        </div>

        {user?.has_openai_key ? (
          <div className="mb-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700 font-medium">API kalit saqlangan</span>
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 size={14} />
              O&apos;chirish
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              API kalit kiritilmagan — AI generatsiya ishlamaydi.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {user?.has_openai_key ? "Yangi kalit bilan almashtirish" : "API kalitni kiriting"}
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Kalit <span className="font-mono">sk-</span> bilan boshlanishi kerak.{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Kalit olish
            </a>
          </p>

          {success && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">{success}</div>
          )}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          <button
            onClick={handleSave}
            disabled={loading || !apiKey.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
