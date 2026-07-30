import { useState, useRef, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { If } from "@shared/ui";
import { useClickOutside, IOption } from "./setRolesModel";

interface IProps {
  options: IOption[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}

export const SetRolesMultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: IProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors"
      >
        <span className={value.length ? "text-slate-900" : "text-slate-400"}>
          {value.length ? `Выбрано: ${value.length}` : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <If is={value.length > 0}>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium"
            >
              {options.find((o) => o.value === v)?.label ?? v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </If>
      <If is={open}>
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => toggle(o.value)}
                className={`w-full px-3.5 py-2.5 text-sm text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${value.includes(o.value) ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
              >
                <span>{o.label}</span>
                <If is={value.includes(o.value)}>
                  <Check className="w-4 h-4 text-indigo-600" />
                </If>
              </button>
            ))}
          </div>
        </div>
      </If>
    </div>
  );
};
