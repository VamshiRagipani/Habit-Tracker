import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Habit {
  id: string;
  icon: string;
  label: string;
  detail?: string | null;
}

export default function HabitCard({
  habit,
  done,
  onToggle,
}: {
  habit: Habit;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      whileTap={{ scale: 0.985 }}
      className="card"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px",
        marginBottom: 8,
        cursor: "pointer",
        borderColor: done ? "rgba(52,211,153,0.3)" : "var(--border)",
        background: done ? "rgba(52,211,153,0.06)" : "var(--surface)",
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ fontSize: 22, minWidth: 26, flexShrink: 0 }}>{habit.icon}</span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 2,
              color: done ? "var(--text-dim)" : "var(--text)",
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {habit.label}
          </div>
          {habit.detail && (
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{habit.detail}</div>
          )}
        </div>
      </div>

      <motion.div
        animate={{
          backgroundColor: done ? "var(--sage-500)" : "transparent",
          borderColor: done ? "var(--sage-500)" : "var(--border)",
        }}
        transition={{ duration: 0.2 }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          border: "2px solid",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
            <Check size={14} color="#0b0c10" strokeWidth={3} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
