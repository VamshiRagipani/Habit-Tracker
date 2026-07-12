import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Habit {
  id: string;
  title?: string;
  description?: string | null;
  icon?: string;
  label?: string;
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
  const title = habit.title ?? habit.label ?? "Habit";
  const description = habit.description ?? habit.detail ?? "";
  const icon = habit.icon ?? "✅";

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
        padding: "14px 14px",
        marginBottom: 8,
        cursor: "pointer",
        borderColor: done ? "rgba(52,211,153,0.3)" : "var(--border)",
        background: done ? "rgba(52,211,153,0.06)" : "var(--surface)",
        transition: "background 0.25s ease, border-color 0.25s ease",
        minHeight: "56px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 20, minWidth: 24, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "clamp(13px, 4vw, 14px)",
              fontWeight: 600,
              marginBottom: 2,
              color: done ? "var(--text-dim)" : "var(--text)",
              textDecoration: done ? "line-through" : "none",
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-faint)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {description}
            </div>
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
          marginLeft: 8,
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
