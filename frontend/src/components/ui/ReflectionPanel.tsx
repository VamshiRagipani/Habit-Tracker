import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function ReflectionPanel({
  value,
  onChange,
  onSave,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 18, marginTop: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--indigo-400)",
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        End of day reflection
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-dim)", marginBottom: 10, fontStyle: "italic" }}>
        Did I move the needle today, or just stay busy?
      </div>
      <textarea
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write honestly — no judgment..."
        style={{ minHeight: 90, resize: "vertical" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save reflection"}
        </button>
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--sage-500)" }}
            >
              <Check size={14} /> Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
