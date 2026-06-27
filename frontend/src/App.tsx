import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import DailyTracker from "./components/DailyTracker";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setCheckingSession(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {session ? (
        <motion.div key="tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <DailyTracker />
        </motion.div>
      ) : (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <Auth />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
