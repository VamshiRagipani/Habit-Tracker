import { motion } from "framer-motion";

interface WeekGoal {
  week: number;
  focus: string;
  color: string;
}

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

export default function PlanView({
  weekGoals,
  currentWeek,
  highlights,
}: {
  weekGoals: WeekGoal[];
  currentWeek: number;
  highlights: Highlight[];
}) {
  return (
    <div>
      <SectionTitle>Your 4-week fix</SectionTitle>
      {weekGoals.map((w, i) => {
        const active = w.week === currentWeek;
        return (
          <motion.div
            key={w.week}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
            style={{
              padding: "12px 16px",
              marginBottom: 8,
              borderLeft: `3px solid ${w.color}`,
              opacity: active ? 1 : 0.55,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: w.color, textTransform: "uppercase", marginBottom: 4 }}>
              Week {w.week} {active ? "← you are here" : ""}
            </div>
            <div style={{ fontSize: 14, color: "var(--text)" }}>{w.focus}</div>
          </motion.div>
        );
      })}

      <SectionTitle style={{ marginTop: 28 }}>Key streak insights</SectionTitle>
      {highlights.length > 0 ? (
        highlights.map((highlight, i) => (
          <motion.div
            key={highlight.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
            style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", marginBottom: 8 }}
          >
            <span style={{ fontSize: 20, marginTop: 2 }}>{highlight.icon}</span>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 3 }}>{highlight.title}</div>
              <div style={{ fontSize: 13, color: "var(--sage-500)", fontWeight: 600 }}>{highlight.description}</div>
            </div>
          </motion.div>
        ))
      ) : (
        <div style={{ color: "var(--text-faint)", fontSize: 14, padding: 14 }}>
          No streak guidance found for the active program.
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--indigo-400)",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
