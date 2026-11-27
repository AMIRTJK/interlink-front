import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SPACE_VARIANTS, type TSpaceVariant } from "../space/model";

interface IProps {
  variant: TSpaceVariant;
}

// Медленный «вдох» кадра: картинка едва заметно приближается и отдаляется.
const DRIFT_SCALE = 1.045;
const DRIFT_SECONDS = 40;
const CROSSFADE_SECONDS = 0.8;

export const SpacePlateBg = ({ variant }: IProps) => {
  const isReducedMotion = useReducedMotion();
  const option = SPACE_VARIANTS.find((item) => item.key === variant) ?? SPACE_VARIANTS[0];

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.img
          key={option.key}
          src={option.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 block w-full h-full object-cover"
          style={{ objectPosition: option.objectPosition }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: isReducedMotion ? 1 : [1, DRIFT_SCALE] }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: CROSSFADE_SECONDS },
            scale: { duration: DRIFT_SECONDS, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
          }}
        />
      </AnimatePresence>
    </div>
  );
};
