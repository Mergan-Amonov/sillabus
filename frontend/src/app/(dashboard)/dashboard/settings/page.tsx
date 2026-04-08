"use client";
import { useState } from "react";
import { Eye, EyeOff, Key, Trash2 } from "lucide-react";
import { updateAiSettings } from "@/lib/auth";
import { useAuthStore } from "@/hooks/useAuth";

const PRESETS = [
  {
    label: "OpenAI",
    base_url: "",
    model: "gpt-4o",
    placeholder: "sk-proj-...",
    hint: "platform.openai.com/api-keys",
    hintUrl: "https://platform.openai.com/api-keys",
  },
  {
    label: "OpenRouter",
    base_url: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o",
    placeholder: "sk-or-v1-...",
    hint: "openrouter.ai/keys",
    hintUrl: "https://openrouter.ai/keys",
  },
  {
    label: "Gemini",
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: "gemini-2.0-flash",
    placeholder: "AIza...",
    hint: "aistudio.google.com/apikey",
    hintUrl: "https://aistudio.google.com/apikey",
  },
  {
    label: "Boshqa",
    base_url: "",
    model: "",
    placeholder: "API kalit...",
    hint: "",
    hintUrl: "",
  },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [preset, setPreset] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(user?.ai_base_url ?? "");
  const [model, setModel] = useState(user?.ai_model ?? "");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const selected = PRESETS[preset];

  const handlePreset = (i: number) => {
    setPreset(i);
    setBaseUrl(PRESETS[i].base_url);
    setModel(PRESETS[i].model);
    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAiSettings({
        openai_api_key: apiKey.trim(),
        ai_base_url: baseUrl.trim() || null,
        ai_model: model.trim() || null,
      });
      setUser(updated);
      setApiKey("");
      setSuccess("Sozlamalar muvaffaqiyatli saqlandi!");
    } catch {
      setError("Saqlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("AI sozlamalarni o'chirmoqchimisiz?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAiSettings({
        openai_api_key: null,
        ai_base_url: null,
        ai_model: null,
      });
      setUser(updated);
      setBaseUrl("");
      setModel("");
      setSuccess("Sozlamalar o'chirildi.");
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
        <p className="text-gray-500 text-sm mt-1">Shaxsiy AI sozlamalaringiz</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Key size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">AI Provayder</h2>
            <p className="text-xs text-gray-500">Xohlagan AI provayderingizni tanlang</p>
          </div>
        </div>

        {user?.has_openai_key && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-700 font-medium">
                API kalit saqlangan
                {user.ai_base_url && (
                  <span className="text-green-600 font-normal ml-1">
                    · {user.ai_base_url.replace("https://", "").split("/")[0]}
                  </span>
                )}
                {user.ai_model && (
                  <span className="text-green-600 font-normal ml-1">· {user.ai_model}</span>
                )}
              </span>
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
        )}

        {/* Provayder tanlash */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Provayder</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => handlePreset(i)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  preset === i
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Kalit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Kalit <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={selected.placeholder}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {selected.hintUrl && (
            <p className="text-xs text-gray-500 mt-1">
              Kalit olish:{" "}
              <a href={selected.hintUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {selected.hint}
              </a>
            </p>
          )}
        </div>

        {/* Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
            <span className="text-gray-400 font-normal ml-1">(ixtiyoriy)</span>
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://openrouter.ai/api/v1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Bo&apos;sh qoldirsangiz OpenAI default ishlatiladi</p>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
            <span className="text-gray-400 font-normal ml-1">(ixtiyoriy)</span>
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            OpenRouter misol:{" "}
            <code className="bg-gray-100 px-1 rounded">google/gemini-2.0-flash-001</code>
          </p>
        </div>

        {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">{success}</div>}
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <button
          onClick={handleSave}
          disabled={loading || !apiKey.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
