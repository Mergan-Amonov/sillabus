"use client";
import { useState } from "react";
import { Eye, EyeOff, Trash2, Cpu, CheckCircle, ChevronDown, ChevronUp, Zap, Mail, Shield } from "lucide-react";
import { updateAiSettings } from "@/lib/auth";
import { useAuthStore } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  university_admin: "Universitet Admin",
  reviewer: "Reviewer",
  teacher: "O'qituvchi",
};

const PROVIDERS = [
  {
    id: "ollama",
    label: "Ollama",
    sublabel: "Local",
    icon: "🦙",
    base_url: "",
    model: "llama3.2",
    placeholder: "",
    keyHint: "",
    keyUrl: "",
    local: true,
    badge: "Bepul",
    badgeColor: "bg-green-100 text-green-700",
    description: "Kompyuteringizdagi model. API kalit shart emas.",
    models: ["llama3.2", "llama3.1:8b", "mistral", "gemma3", "qwen2.5"],
  },
  {
    id: "openai",
    label: "OpenAI",
    sublabel: "GPT",
    icon: "⚡",
    base_url: "",
    model: "gpt-4o",
    placeholder: "sk-proj-...",
    keyHint: "platform.openai.com/api-keys",
    keyUrl: "https://platform.openai.com/api-keys",
    local: false,
    badge: "To'lov",
    badgeColor: "bg-yellow-100 text-yellow-700",
    description: "GPT-4o, GPT-4o-mini va boshqalar.",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    sublabel: "Multi",
    icon: "🔀",
    base_url: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    placeholder: "sk-or-v1-...",
    keyHint: "openrouter.ai/keys",
    keyUrl: "https://openrouter.ai/keys",
    local: false,
    badge: "Bepul bor",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "100+ model. :free modellari bepul.",
    models: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-3-27b-it:free",
      "qwen/qwen3-coder:free",
      "openai/gpt-4o",
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    sublabel: "Google",
    icon: "✦",
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: "gemini-2.0-flash",
    placeholder: "AIza...",
    keyHint: "aistudio.google.com/apikey",
    keyUrl: "https://aistudio.google.com/apikey",
    local: false,
    badge: "Bepul bor",
    badgeColor: "bg-purple-100 text-purple-700",
    description: "Gemini 2.0 Flash bepul kvota bilan.",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
  {
    id: "custom",
    label: "Boshqa",
    sublabel: "Custom",
    icon: "⚙",
    base_url: "",
    model: "",
    placeholder: "API kalit...",
    keyHint: "",
    keyUrl: "",
    local: false,
    badge: "",
    badgeColor: "",
    description: "OpenAI-compatible istalgan provayder.",
    models: [],
  },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [selectedId, setSelectedId] = useState("ollama");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(user?.ai_base_url ?? "");
  const [model, setModel] = useState(user?.ai_model ?? "");
  const [showKey, setShowKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const provider = PROVIDERS.find((p) => p.id === selectedId)!;

  const handleSelect = (id: string) => {
    const p = PROVIDERS.find((x) => x.id === id)!;
    setSelectedId(id);
    setBaseUrl(p.base_url);
    setModel(p.model);
    setApiKey("");
    setSuccess("");
    setError("");
  };

  const handleModelSelect = (m: string) => {
    setModel(m);
  };

  const handleSave = async () => {
    if (!provider.local && !apiKey.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAiSettings({
        openai_api_key: provider.local ? null : apiKey.trim(),
        ai_base_url: baseUrl.trim() || null,
        ai_model: model.trim() || null,
      });
      setUser(updated);
      setApiKey("");
      setSuccess("Sozlamalar saqlandi!");
    } catch {
      setError("Saqlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/ai/generate", {
        course_title: "Test",
        course_code: "TST101",
        credit_hours: 3,
        level: "undergraduate",
      });
      setSuccess("Ulanish muvaffaqiyatli! AI ishlayapti.");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Ulanishda xatolik. Sozlamalarni tekshiring.");
    } finally {
      setTesting(false);
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
      setSelectedId("ollama");
      setSuccess("O'chirildi. Server Ollama si ishlatiladi.");
    } catch {
      setError("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const canSave = provider.local ? true : !!apiKey.trim();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-gray-500 text-sm mt-1">Profil va AI sozlamalaringiz</p>
      </div>

      {/* Profil kartasi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Profil</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-blue-600">
              {user?.full_name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">{user?.full_name}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Mail size={12} />
                {user?.email}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Shield size={12} />
                {ROLE_LABELS[user?.role ?? ""] ?? user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Provayder kartasi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">AI Provayder</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Default: server dagi Ollama. Shaxsiy kalit bilan istalgan provayderingizni uling.
            </p>
          </div>
        </div>

        {/* Joriy holat — faqat Ollama default bo'lsa ko'rinadi */}
        {!user?.has_openai_key && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
            <Cpu size={15} className="text-slate-500 shrink-0" />
            <p className="text-sm text-slate-600">
              Server dagi <span className="font-medium text-slate-800">Ollama (llama3.2)</span> ishlatilmoqda
            </p>
          </div>
        )}

        {/* Provayder tanlash */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                selectedId === p.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg leading-none">{p.icon}</span>
                {p.badge && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                )}
              </div>
              <span className={`text-sm font-semibold ${selectedId === p.id ? "text-blue-700" : "text-gray-800"}`}>
                {p.label}
              </span>
              <span className="text-[11px] text-gray-400">{p.sublabel}</span>
              {selectedId === p.id && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500">{provider.description}</p>

        {/* API Kalit — local uchun ko'rsatilmaydi */}
        {!provider.local && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              API Kalit <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider.placeholder}
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {provider.keyUrl && (
              <p className="text-xs text-gray-400 mt-1">
                Kalit olish:{" "}
                <a href={provider.keyUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  {provider.keyHint}
                </a>
              </p>
            )}
          </div>
        )}

        {/* Model tez tanlash */}
        {provider.models.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Model</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {provider.models.map((m) => (
                <button
                  key={m}
                  onClick={() => handleModelSelect(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                    model === m
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="yoki o'zingiz yozing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-gray-50"
            />
          </div>
        )}

        {/* Ilg'or sozlamalar */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Ilg&apos;or sozlamalar (Base URL)
          </button>
          {showAdvanced && (
            <div className="mt-3">
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={provider.base_url || "https://..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-gray-50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Bo&apos;sh qoldirilsa provayder default URL ishlatiladi
              </p>
            </div>
          )}
        </div>

        {/* Xabarlar */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            <CheckCircle size={15} className="shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Tugmalar */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={loading || !canSave}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || loading}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Zap size={14} />
            {testing ? "..." : "Test"}
          </button>
          {user?.has_openai_key && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
