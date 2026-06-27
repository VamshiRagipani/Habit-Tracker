import { motion } from "framer-motion";
import { CalendarCheck, History, Map } from "lucide-react";

const TABS = [
  { key: "today", label: "Today", icon: CalendarCheck },
  { key: "history", label: "History", icon: History },
  { key: "plan", label: "Plan", icon: Map },
] as const;

export type ViewKey = (typeof TABS)[number]["key"];

export default function NavTabs({ view, onChange }: { view: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className="card"
      style={{ display: "flex", gap: 4, padding: 4, marginTop: 16, position: "relative" }}
    >
      {TABS.map((tab) => {
        const active = tab.key === view;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className="btn"
            style={{
              flex: 1,
              position: "relative",
              padding: "9px 0",
              background: "transparent",
              color: active ? "var(--text)" : "var(--text-dim)",
              zIndex: 1,
            }}
          >
            {active && (
              <motion.span
                layoutId="navActive"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  zIndex: -1,
                }}
              />
            )}
            <Icon size={14} style={{ marginRight: 6 }} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
