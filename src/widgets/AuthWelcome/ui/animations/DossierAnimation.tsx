import { motion } from "framer-motion";
import { IWelcomeAnimationProps } from "../../model";
import { BrandReveal } from "../parts/BrandReveal";
import { PaperSheet } from "../parts/PaperSheet";
import { SignatureStamp } from "../parts/SignatureStamp";

const SHEETS = [
  {
    id: "sheet-1",
    from: { x: -620, y: -300, rotate: -34 },
    rest: { x: -26, y: -18, rotate: -8 },
    away: { x: -420, y: -220, rotate: -26 },
    lines: 5,
  },
  {
    id: "sheet-2",
    from: { x: 640, y: -260, rotate: 30 },
    rest: { x: 18, y: -10, rotate: 6 },
    away: { x: 460, y: -180, rotate: 22 },
    lines: 4,
  },
  {
    id: "sheet-3",
    from: { x: -560, y: 320, rotate: 24 },
    rest: { x: -12, y: -4, rotate: -3 },
    away: { x: -360, y: 260, rotate: 18 },
    lines: 6,
  },
  {
    id: "sheet-4",
    from: { x: 580, y: 340, rotate: -26 },
    rest: { x: 10, y: 2, rotate: 4 },
    away: { x: 400, y: 280, rotate: -20 },
    lines: 5,
  },
  {
    id: "sheet-5",
    from: { x: 0, y: -420, rotate: 16 },
    rest: { x: -4, y: 8, rotate: -2 },
    away: { x: -80, y: -320, rotate: 12 },
    lines: 4,
  },
  {
    id: "sheet-6",
    from: { x: 0, y: 440, rotate: -14 },
    rest: { x: 4, y: 14, rotate: 2 },
    away: { x: 120, y: 320, rotate: -10 },
    lines: 6,
  },
];

const SHEET_DURATION = 5;
const SHEET_TIMES = [0, 0.26, 0.46, 0.9];
const SHEET_STEP = 0.09;
const STAMP_AT = 2.55;
const FLASH_AT = 3.05;

export const DossierAnimation = ({
  userName,
  themeGradient,
  accentColor,
}: IWelcomeAnimationProps) => (
  <div className="absolute inset-0 overflow-hidden [perspective:1400px]">
    <div
      className={`absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${themeGradient} opacity-25 blur-[140px]`}
    />

    <div className="absolute inset-0 flex items-center justify-center">
      {SHEETS.map((sheet, index) => (
        <motion.div
          key={sheet.id}
          initial={{
            x: sheet.from.x,
            y: sheet.from.y,
            rotate: sheet.from.rotate,
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            x: [sheet.from.x, sheet.rest.x, sheet.rest.x, sheet.away.x],
            y: [sheet.from.y, sheet.rest.y, sheet.rest.y, sheet.away.y],
            rotate: [sheet.from.rotate, sheet.rest.rotate, 0, sheet.away.rotate],
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1, 0.86],
          }}
          transition={{
            duration: SHEET_DURATION,
            times: SHEET_TIMES,
            delay: index * SHEET_STEP,
            ease: "easeInOut",
          }}
          className="absolute"
        >
          <PaperSheet lines={sheet.lines} themeGradient={themeGradient} />
        </motion.div>
      ))}

      <SignatureStamp
        accentColor={accentColor}
        appearAt={STAMP_AT}
        flashAt={FLASH_AT}
      />
    </div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1] }}
      transition={{ duration: 4.6, times: [0, 0.78, 1], ease: "easeOut" }}
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.35)_0%,#020617_75%)]"
    />

    <div className="relative flex h-full w-full items-center justify-center">
      <BrandReveal
        userName={userName}
        themeGradient={themeGradient}
        delaySec={4.5}
      />
    </div>
  </div>
);
