import { motion } from "framer-motion";
import { Flame, LogOut } from "lucide-react";

interface HeaderProps {
  greetingName: string;
  streak: number;
  onSignOut: () => void;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Header({ greetingName, streak, onSignOut }: HeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          Good {getGreeting()}{greetingName ? `, ${greetingName}` : ""}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderColor: streak > 0 ? "rgba(245,151,61,0.35)" : "var(--border)",
          }}
          title={`${streak} day streak`}
        >
          <Flame
            size={16}
            color={streak > 0 ? "#f59e0b" : "var(--text-dim)"}
            fill={streak > 0 ? "rgba(245, 151, 61, 0.25)" : "none"}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14 }}>{streak}</span>
        </div>
        <button
          className="btn btn-ghost"
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          style={{ padding: 8 }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </motion.div>
  );
}
