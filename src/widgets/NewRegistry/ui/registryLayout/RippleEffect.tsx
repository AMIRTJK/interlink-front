import { motion } from "framer-motion";

// Компонент эффекта волны (Ripple)
export const RippleEffect = ({ x, y }: { x: number; y: number }) => (
  <motion.span
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 2.5, opacity: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 100,
      height: 100,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  />
);
