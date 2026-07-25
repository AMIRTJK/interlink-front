import { motion } from "framer-motion";
import { IWelcomeAnimationProps } from "../../model";
import { BrandReveal } from "../parts/BrandReveal";

const NODES = [
  { x: 400, y: 250, r: 7 },
  { x: 250, y: 150, r: 5 },
  { x: 550, y: 150, r: 5 },
  { x: 250, y: 350, r: 5 },
  { x: 550, y: 350, r: 5 },
  { x: 400, y: 90, r: 4 },
  { x: 400, y: 410, r: 4 },
  { x: 130, y: 250, r: 4 },
  { x: 670, y: 250, r: 4 },
  { x: 160, y: 90, r: 3 },
  { x: 640, y: 90, r: 3 },
  { x: 160, y: 410, r: 3 },
  { x: 640, y: 410, r: 3 },
  { x: 300, y: 250, r: 3 },
  { x: 500, y: 250, r: 3 },
];

const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 13], [0, 14],
  [1, 5], [2, 5], [3, 6], [4, 6], [1, 7], [3, 7], [2, 8], [4, 8],
  [1, 9], [2, 10], [3, 11], [4, 12], [13, 7], [14, 8],
];

const PULSES = [
  { from: 9, to: 1, delay: 2.3 },
  { from: 12, to: 4, delay: 2.6 },
  { from: 5, to: 0, delay: 2.9 },
];

const EDGE_STEP = 0.075;
const NODE_STEP = 0.05;
const COLLAPSE_AT = 3.5;

export const NeuralAnimation = ({
  userName,
  themeGradient,
  accentColor,
}: IWelcomeAnimationProps) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className={`absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${themeGradient} opacity-20 blur-[130px]`}
    />

    <motion.svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 5, times: [0, 0.08, 0.72, 0.9], ease: "easeInOut" }}
      className="absolute inset-0 h-full w-full"
    >
      <motion.g
        initial={{ scale: 1 }}
        animate={{ scale: 0.2 }}
        transition={{ duration: 1, delay: COLLAPSE_AT, ease: "easeIn" }}
        className="[transform-box:fill-box] [transform-origin:center]"
      >
        {EDGES.map(([from, to], index) => (
          <motion.line
            key={`edge-${from}-${to}`}
            x1={NODES[from].x}
            y1={NODES[from].y}
            x2={NODES[to].x}
            y2={NODES[to].y}
            stroke={accentColor}
            strokeWidth={1.1}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{
              duration: 0.55,
              delay: 0.35 + index * EDGE_STEP,
              ease: "easeInOut",
            }}
          />
        ))}

        {NODES.map((node, index) => (
          <g key={`node-${node.x}-${node.y}`}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r * 3}
              fill={accentColor}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.16, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: index * NODE_STEP,
                ease: "easeOut",
              }}
              className="[transform-box:fill-box] [transform-origin:center]"
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="#ffffff"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: index * NODE_STEP,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="[transform-box:fill-box] [transform-origin:center]"
            />
          </g>
        ))}

        {PULSES.map((pulse) => (
          <motion.circle
            key={`pulse-${pulse.from}-${pulse.to}`}
            r={3.5}
            fill="#ffffff"
            initial={{
              cx: NODES[pulse.from].x,
              cy: NODES[pulse.from].y,
              opacity: 0,
            }}
            animate={{
              cx: [NODES[pulse.from].x, NODES[pulse.to].x],
              cy: [NODES[pulse.from].y, NODES[pulse.to].y],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.9, delay: pulse.delay, ease: "easeInOut" }}
          />
        ))}
      </motion.g>
    </motion.svg>

    <div className="relative flex h-full w-full items-center justify-center">
      <BrandReveal
        userName={userName}
        themeGradient={themeGradient}
        delaySec={4.1}
      />
    </div>
  </div>
);
