interface IProps {
  lines: number;
  themeGradient: string;
}

const LINE_WIDTHS = [
  "w-full",
  "w-11/12",
  "w-10/12",
  "w-full",
  "w-9/12",
  "w-11/12",
];

export const PaperSheet = ({ lines, themeGradient }: IProps) => (
  <div className="flex h-56 w-40 flex-col gap-3 rounded-xl border border-white/15 bg-white/8 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-sm sm:h-72 sm:w-52 sm:gap-4 sm:p-5">
    <div className="flex items-center gap-2">
      <div
        className={`h-6 w-6 rounded-md bg-gradient-to-br ${themeGradient} sm:h-7 sm:w-7`}
      />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-1.5 w-3/4 rounded-full bg-white/40" />
        <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
      </div>
    </div>

    <div className="h-px w-full bg-white/12" />

    <div className="flex flex-1 flex-col gap-2 sm:gap-2.5">
      {LINE_WIDTHS.slice(0, lines).map((width, index) => (
        <div
          key={`${width}-${index}`}
          className={`h-1.5 rounded-full bg-white/18 ${width}`}
        />
      ))}
    </div>

    <div className="flex items-center justify-between">
      <div className="h-1.5 w-8 rounded-full bg-white/25" />
      <div className="h-5 w-5 rounded-full border border-white/25 sm:h-6 sm:w-6" />
    </div>
  </div>
);
