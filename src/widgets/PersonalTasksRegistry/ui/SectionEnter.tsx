import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Появление раздела сдвигом, без прозрачности: родитель с opacity < 1 отключает
// backdrop-filter у вложенного стекла, и первые кадры выглядели бледными, будто
// тема подгружается с задержкой. Сдвиг стеклу не мешает — цвета видны сразу.
const ENTER = { initial: { y: 10 }, animate: { y: 0 } };
const ENTER_TRANSITION = { duration: 0.25, ease: "easeOut" } as const;

interface IProps {
  children: ReactNode;
  className?: string;
}

export const SectionEnter = ({ children, className }: IProps) => {
  const isReducedMotion = useReducedMotion();
  if (isReducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div {...ENTER} transition={ENTER_TRANSITION} className={className}>
      {children}
    </motion.div>
  );
};
