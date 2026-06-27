import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function Toast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          role="alert"
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            maxWidth: "min(420px, calc(100vw - 32px))",
            background: "var(--surface-2)",
            border: "1px solid rgba(248,113,113,0.35)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          }}
        >
          <AlertTriangle size={16} color="var(--red-500)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.4 }}>{message}</span>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="btn btn-ghost"
            style={{ padding: 2, marginLeft: "auto", flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
