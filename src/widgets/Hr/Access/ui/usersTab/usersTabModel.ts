export const ROLE_CHIP_STYLE_MAP: Record<
  string,
  { border: string; bg: string; text: string; dot: string }
> = {
  super_admin: {
    border: "border-blue-400!",
    bg: "bg-blue-50/50!",
    text: "text-blue-600!",
    dot: "bg-blue-500!",
  },
  recipient: {
    border: "border-emerald-400!",
    bg: "bg-emerald-50/50!",
    text: "text-emerald-600!",
    dot: "bg-emerald-500!",
  },
  signer: {
    border: "border-orange-400!",
    bg: "bg-orange-50/50!",
    text: "text-orange-600!",
    dot: "bg-orange-500!",
  },
  approvaler: {
    border: "border-indigo-400!",
    bg: "bg-indigo-50/50!",
    text: "text-indigo-600!",
    dot: "bg-indigo-500!",
  },
  controller: {
    border: "border-purple-400!",
    bg: "bg-purple-50/50!",
    text: "text-purple-600!",
    dot: "bg-purple-500!",
  },
  observer: {
    border: "border-slate-300!",
    bg: "bg-slate-50!",
    text: "text-slate-500!",
    dot: "bg-slate-400!",
  },
};
