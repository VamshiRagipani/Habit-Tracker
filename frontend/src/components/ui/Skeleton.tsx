export default function DashboardSkeleton() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="skeleton" style={{ width: 160, height: 22, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 120, height: 13 }} />
        </div>
        <div className="skeleton" style={{ width: 52, height: 36, borderRadius: 10 }} />
      </div>

      <div className="skeleton" style={{ height: 48, marginTop: 16, borderRadius: 14 }} />
      <div className="skeleton" style={{ height: 44, marginTop: 16, borderRadius: 14 }} />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 20, marginTop: 16 }}>
        <div className="skeleton" style={{ width: 110, height: 110, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: "70%", height: 16, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: "50%", height: 12 }} />
        </div>
      </div>

      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton" style={{ height: 60, marginTop: 8, borderRadius: 14 }} />
      ))}
    </div>
  );
}
