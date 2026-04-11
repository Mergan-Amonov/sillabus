import { Plus, Trash2 } from "lucide-react";
import type { SyllabusFormData } from "./types";

interface Props {
  data: SyllabusFormData;
  onChange: (updates: Partial<SyllabusFormData>) => void;
}

interface ListEditorProps {
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (items: string[]) => void;
}

function ListEditor({ items, placeholder, addLabel, onChange }: ListEditorProps) {
  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic py-2">Hozircha bo&apos;sh — qo&apos;shing yoki AI dan foydalaning</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-xs text-gray-400 mt-2.5 w-5 shrink-0 text-right">{i + 1}.</span>
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-1.5 p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors mt-1"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

export function SyllabusFormOutcomes({ data, onChange }: Props) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">O&apos;quv natijalari</h3>
        <p className="text-xs text-gray-500 mb-3">
          Kursni tugatgach talaba nima qila olishi kerak? Har bir natija alohida qatorga.
        </p>
        <ListEditor
          items={data.learning_outcomes}
          placeholder="Talaba ... ni bajarа oladi"
          addLabel="Natija qo'shish"
          onChange={(items) => onChange({ learning_outcomes: items })}
        />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Kompetensiyalar</h3>
        <p className="text-xs text-gray-500 mb-3">
          Kurs rivojlantiradigan kasbiy va umumiy kompetensiyalar.
        </p>
        <ListEditor
          items={data.competencies}
          placeholder="Masalan: Kritik fikrlash, Jamoaviy ishlash..."
          addLabel="Kompetensiya qo'shish"
          onChange={(items) => onChange({ competencies: items })}
        />
      </div>
    </div>
  );
}
