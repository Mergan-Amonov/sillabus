import { Plus, Trash2 } from "lucide-react";
import type { SyllabusFormData } from "./types";
import type { TextbookEntry, OnlineResourceEntry } from "@/types";

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
}

const INPUT = "px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

export function SyllabusFormResources({ data, onChange }: Props) {
  // ── Textbooks ────────────────────────────────────────────────────────────
  const addBook = () =>
    onChange({
      textbooks: [
        ...data.textbooks,
        { title: "", author: "", year: new Date().getFullYear(), publisher: "", required: true },
      ],
    });

  const updateBook = (i: number, updates: Partial<TextbookEntry>) => {
    const next = data.textbooks.map((b, idx) => (idx === i ? { ...b, ...updates } : b));
    onChange({ textbooks: next });
  };

  const removeBook = (i: number) =>
    onChange({ textbooks: data.textbooks.filter((_, idx) => idx !== i) });

  // ── Online resources ─────────────────────────────────────────────────────
  const addResource = () =>
    onChange({
      online_resources: [...data.online_resources, { name: "", url: "", description: "" }],
    });

  const updateResource = (i: number, updates: Partial<OnlineResourceEntry>) => {
    const next = data.online_resources.map((r, idx) => (idx === i ? { ...r, ...updates } : r));
    onChange({ online_resources: next });
  };

  const removeResource = (i: number) =>
    onChange({ online_resources: data.online_resources.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-8">
      {/* Textbooks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Darsliklar va adabiyotlar</h3>
            <p className="text-xs text-gray-500 mt-0.5">Asosiy va qo&apos;shimcha adabiyotlar</p>
          </div>
          <button
            type="button"
            onClick={addBook}
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus size={13} /> Kitob qo&apos;shish
          </button>
        </div>

        {data.textbooks.length === 0 && (
          <p className="text-sm text-gray-400 italic py-2">Hozircha bo&apos;sh</p>
        )}

        <div className="space-y-3">
          {data.textbooks.map((book, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex gap-2 mb-2">
                <span className="text-xs text-gray-400 mt-1.5 w-4 shrink-0">{i + 1}.</span>
                <input
                  value={book.title}
                  onChange={(e) => updateBook(i, { title: e.target.value })}
                  placeholder="Kitob nomi"
                  className={INPUT + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => removeBook(i)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 ml-6">
                <input
                  value={book.author}
                  onChange={(e) => updateBook(i, { author: e.target.value })}
                  placeholder="Muallif"
                  className={INPUT}
                />
                <input
                  value={book.publisher ?? ""}
                  onChange={(e) => updateBook(i, { publisher: e.target.value })}
                  placeholder="Nashriyot"
                  className={INPUT}
                />
                <input
                  type="number"
                  value={book.year}
                  onChange={(e) => updateBook(i, { year: Number(e.target.value) })}
                  placeholder="Yil"
                  className={INPUT}
                />
              </div>
              <div className="mt-2 ml-6">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={book.required}
                    onChange={(e) => updateBook(i, { required: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Asosiy adabiyot (required)
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online resources */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Onlayn resurslar</h3>
            <p className="text-xs text-gray-500 mt-0.5">Veb-saytlar, kurslar, platformalar</p>
          </div>
          <button
            type="button"
            onClick={addResource}
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus size={13} /> Resurs qo&apos;shish
          </button>
        </div>

        {data.online_resources.length === 0 && (
          <p className="text-sm text-gray-400 italic py-2">Hozircha bo&apos;sh</p>
        )}

        <div className="space-y-3">
          {data.online_resources.map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex gap-2 mb-2">
                <span className="text-xs text-gray-400 mt-1.5 w-4 shrink-0">{i + 1}.</span>
                <input
                  value={r.name}
                  onChange={(e) => updateResource(i, { name: e.target.value })}
                  placeholder="Resurs nomi"
                  className={INPUT + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => removeResource(i)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-6">
                <input
                  value={r.url}
                  onChange={(e) => updateResource(i, { url: e.target.value })}
                  placeholder="https://..."
                  className={INPUT + " font-mono text-xs"}
                />
                <input
                  value={r.description ?? ""}
                  onChange={(e) => updateResource(i, { description: e.target.value })}
                  placeholder="Qisqacha tavsif"
                  className={INPUT}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
