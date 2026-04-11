import { Check } from "lucide-react";
import { STEPS } from "./types";

interface Props {
  current: number; // 1-based
}

export function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-primary-600 text-white"
                    : active
                    ? "bg-primary-600 text-white ring-4 ring-primary-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check size={14} /> : n}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium whitespace-nowrap ${
                  active ? "text-primary-600" : done ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 transition-colors ${
                  done ? "bg-primary-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
