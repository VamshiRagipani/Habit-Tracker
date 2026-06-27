import { motion } from "framer-motion";

interface WeekGoal {
  week: number;
  focus: string;
  color: string;
}

export default function WeekBanner({ weekGoal }: { weekGoal: WeekGoal }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        marginTop: 16,
        borderColor: `${weekGoal.color}40`,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 600,
          color: "#0b0c10",
          background: weekGoal.color,
          borderRadius: 6,
          padding: "3px 8px",
          whiteSpace: "nowrap",
        }}
      >
        WEEK {weekGoal.week}
      </span>
      <span style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.4 }}>{weekGoal.focus}</span>
    </motion.div>
  );
}
