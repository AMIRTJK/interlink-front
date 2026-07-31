import React from "react";

interface IProps {
  label: string;
  children: React.ReactNode;
}

export const DetailField: React.FC<IProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {label}
    </span>
    {children}
  </div>
);
