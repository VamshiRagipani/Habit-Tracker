import { motion, useReducedMotion } from "framer-motion";

interface ProgressRingProps {
  pct: number;
  done: number;
  total: number;
  size?: number;
}

export default function ProgressRing({ pct, done, total, size = 132 }: ProgressRingProps) {
  const reduceMotion = useReducedMotion();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const complete = done === total && total > 0;

  return (
    <div style={{ width: size, height: size, position: "relative" }} role="img" aria-label={`${pct}% complete`}>
      <motion.div
        animate={complete ? { boxShadow: ["0 0 0 rgba(245,151,61,0)", "0 0 36px rgba(245,151,61,0.4)", "0 0 0 rgba(245,151,61,0)"] } : {}}
        transition={{ duration: 2.4, repeat: complete ? Infinity : 0, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, borderRadius: "50%" }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="emberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--ember-400)" />
            <stop offset="100%" stopColor="var(--ember-600)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#emberGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 18 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          {pct}%
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>
          {done}/{total}
        </span>
      </div>
    </div>
  );
}
