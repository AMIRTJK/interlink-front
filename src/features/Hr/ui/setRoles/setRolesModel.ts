import { useEffect } from "react";

export interface IOption {
  value: string;
  label: string;
}

export const useClickOutside = (
  ref: React.RefObject<HTMLDivElement | null>,
  cb: () => void,
) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
};
