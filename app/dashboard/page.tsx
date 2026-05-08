"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Zap, Trophy, TrendingUp, Star, ArrowUpRight, Clock, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Stats {
  ecBalance: number; totalEcEarned: number; totalEcRedeemed: number;
  reputationScore: number; integrityMultiplier: number;
  pendingContributions: number; approvedContributions: number;
  weeklyEcEarned: number; weeklyCap: number;
  rank: number; totalUsers: number;
  chartData: { day: string; ec: number }[];
}

interface Contrib { id: string; title: string; type: string; hoursClaimed: number; status: string; ecAwarded: number; submittedAt: string; }

const STATUS_COLOR: Record<string, string> = { pending: "#f59e0b", approved: "#10b981", rejected: "#f43f5e" };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contribs, setContribs] = useState<Contrib[]>([]);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("ec_user");
    if (!raw) { router.replace("/login"); return; }
    setUser(JSON.parse(raw));
    Promise.all([
      api.get<Stats>("/api/users/stats"),
      api.get<Contrib[]>("/api/contributions"),
    ]).then(([s, c]) => {
      setStats(s);
      setContribs(c.slice(0, 6));
    }).catch(() => router.replace("/login"));
  }, [router]);

  const weekPct = stats ? Math.min((stats.weeklyEcEarned / stats.weeklyCap) * 100, 100) : 0;

  if (!stats) return (
    <div style={{ padding: "80px 40px", display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[280, 200, 240, 180].map((w, i) => (
          <div key={i} className="shimmer" style={{ height: 18, width: w, borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={{ padding: "32px 36px", maxWidth: 1080 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
          Hey, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Here's your Energy Credit overview for today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard icon={<Zap size={16} />} label="EC Balance" value={stats.ecBalance.toFixed(1)} unit="EC" color="#f59e0b" />
        <StatCard icon={<TrendingUp size={16} />} label="Total Earned" value={stats.totalEcEarned.toFixed(1)} unit="EC" color="#10b981" />
        <StatCard icon={<Trophy size={16} />} label="Global Rank" value={`#${stats.rank}`} unit={`of ${stats.totalUsers}`} color="#7c3aed" />
        <StatCard icon={<Star size={16} />} label="Reputation" value={stats.reputationScore.toFixed(1)} unit="/ 5.0" color="#a78bfa" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, marginBottom: 20 }}>
        {/* Area chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>Weekly EC Activity</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Last 7 days contributions</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>{stats.weeklyEcEarned.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>of {stats.weeklyCap} EC cap</div>
            </div>
          </div>
          {/* Cap progress */}
          <div style={{ height: 5, background: "var(--surface-hover)", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${weekPct}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 3, transition: "width 1s ease" }} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="ecG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-2)", border: "1px solid var(--border-accent)", borderRadius: 8, color: "var(--text)", fontSize: 12 }} />
              <Area type="monotone" dataKey="ec" stroke="#7c3aed" fill="url(#ecG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Integrity */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Integrity Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14, fontSize: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: stats.integrityMultiplier >= 1 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
              }}>
                {stats.integrityMultiplier >= 1 ? "✅" : "⚠️"}
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: 26, fontWeight: 700, color: stats.integrityMultiplier >= 1 ? "#10b981" : "#f43f5e" }}>
                  {stats.integrityMultiplier}×
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{stats.integrityMultiplier >= 1 ? "Clean record" : "Penalty active"}</div>
              </div>
            </div>
          </div>

          {/* Contribution split */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Submissions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { l: "Pending", v: stats.pendingContributions, c: "#f59e0b" },
                { l: "Approved", v: stats.approvedContributions, c: "#10b981" },
              ].map(s => (
                <div key={s.l} style={{ background: `${s.c}0f`, border: `1px solid ${s.c}25`, borderRadius: 10, padding: "12px 14px" }}>
                  <div className="font-mono" style={{ fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <a href="/contribute" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", textDecoration: "none", display: "flex" }}>
              Submit Contribution <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Recent contributions */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <span className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>Recent Submissions</span>
          <a href="/profile" style={{ fontSize: 12, color: "var(--accent-2)", textDecoration: "none" }}>View all →</a>
        </div>
        {contribs.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No submissions yet.{" "}
            <a href="/contribute" style={{ color: "var(--accent-2)" }}>Submit your first contribution →</a>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Hours</th><th>Status</th><th>EC Awarded</th><th>Date</th></tr>
            </thead>
            <tbody>
              {contribs.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, maxWidth: 280 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{c.title}</span>
                  </td>
                  <td><span style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>{c.type}</span></td>
                  <td><span className="font-mono" style={{ fontSize: 13 }}>{c.hoursClaimed}h</span></td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>
                    {c.ecAwarded > 0
                      ? <span className="font-mono" style={{ color: "#f59e0b", fontWeight: 700 }}>+{c.ecAwarded}</span>
                      : <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(c.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string; }) {
  return (
    <div className="stat-card card-glow">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      </div>
      <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>{unit}</div>
    </div>
  );
}
