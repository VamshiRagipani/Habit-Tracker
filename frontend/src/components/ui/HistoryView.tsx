import { motion } from "framer-motion";

interface Bar {
  key: string;
  label: string;
  done: number;
  isToday: boolean;
}

interface Reflection {
  id: string;
  log_date: string;
  body: string;
}

export default function HistoryView({
  bars,
  total,
  reflections,
}: {
  bars: Bar[];
  total: number;
  reflections: Reflection[];
}) {
  return (
    <div>
      <div className="card" style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--indigo-400)",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Last 7 days
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {bars.map((d, i) => {
            const h = total ? Math.max((d.done / total) * 86, 6) : 6;
            const color = d.isToday
              ? "var(--indigo-500)"
              : d.done >= total * 0.7
              ? "var(--sage-500)"
              : d.done >= total * 0.4
              ? "var(--ember-500)"
              : "var(--border)";
            return (
              <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 90, display: "flex", alignItems: "flex-end", width: "100%" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                    style={{ width: "100%", borderRadius: 5, background: color, minHeight: 4 }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: d.isToday ? "var(--indigo-400)" : "var(--text-dim)",
                    fontWeight: d.isToday ? 700 : 500,
                  }}
                >
                  {d.label}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)" }}>
                  {d.done}/{total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--indigo-400)",
          letterSpacing: 1,
          textTransform: "uppercase",
          marginTop: 20,
          marginBottom: 10,
        }}
      >
        Past reflections
      </div>

      {reflections.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card"
          style={{ padding: "12px 14px", marginBottom: 8 }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ember-500)", fontWeight: 600, marginBottom: 4 }}>
            {r.log_date}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
            {r.body || <em style={{ color: "var(--text-faint)" }}>No entry</em>}
          </div>
        </motion.div>
      ))}
      {reflections.length === 0 && (
        <div style={{ color: "var(--text-faint)", fontSize: 14, textAlign: "center", padding: 24 }}>
          No reflections yet. Start today.
        </div>
      )}
    </div>
  );
}
