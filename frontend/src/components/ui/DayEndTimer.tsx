import { useEffect, useState } from "react";

function msUntilNextIstMidnight(): number {
  const now = new Date();
  const nowUtcMs = now.getTime();
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000; // IST = UTC+5:30

  // Build IST 'now' for extracting Y/M/D
  const istNow = new Date(nowUtcMs + now.getTimezoneOffset() * 60000 + istOffsetMs);
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const d = istNow.getUTCDate();

  // The UTC epoch ms for the IST midnight of the next day is:
  // Date.UTC(y,m,d+1,0,0,0) interpreted as UTC, then shift back by IST offset
  const nextIstMidnightUtcMs = Date.UTC(y, m, d + 1, 0, 0, 0) - istOffsetMs;

  return Math.max(0, nextIstMidnightUtcMs - nowUtcMs);
}

function formatMsHoursMinutes(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  return `${hrs}h ${mins} mins`;
}

export default function DayEndTimer({ compact }: { compact?: boolean }) {
  const [remainingMs, setRemainingMs] = useState<number>(() => msUntilNextIstMidnight());

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs(msUntilNextIstMidnight());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const imgUrl = "/assets/timer-image.png"; // put your uploaded image at public/assets/timer-image.png

  if (compact) {
    const timeStr = formatMsHoursMinutes(remainingMs);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase" }}>
          Time left today
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div
            aria-label="time-until-day-end"
            title="Day ends in IST"
            style={{ fontSize: 27, fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: -0.5, whiteSpace: "nowrap" }}
          >
            {timeStr}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 8, marginLeft: 6 }}>
      <div
        aria-hidden
        style={{
          width: 96,
          height: 96,
          borderRadius: "18px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f11",
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <img
          src={imgUrl}
          alt="timer"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          aria-label="time-until-day-end"
          title="Day ends in IST"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: 0.6,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            background: "linear-gradient(180deg, rgba(0,0,0,0.24), rgba(0,0,0,0.36))",
            whiteSpace: "nowrap",
          }}
        >
          {formatMsHoursMinutes(remainingMs)}
        </div>
      </div>
    </div>
  );
}
