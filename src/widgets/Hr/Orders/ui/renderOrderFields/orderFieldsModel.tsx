export const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/10 focus:border-[#1E3A5F] focus:bg-white text-gray-800 transition-all";

export const labelCls =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

export const selectStyle = { width: '100%', height: 42 };

export interface IOrderFieldsProps {
  state: any;
  methods: any;
  orgs: any[];
  users: any[];
}

export const SectionTitle = ({ num, title }: { num: number; title: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs font-bold shrink-0">{num}</div>
    <div className="w-0.5 h-4 bg-slate-200" />
    <span className="font-bold text-[#1E3A5F] text-[13px] tracking-wide uppercase">{title}</span>
  </div>
);
