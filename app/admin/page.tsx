"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "@/components/Toaster";
import { ShieldCheck, Users, Zap, ShoppingCart, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Contribution {
  id: string; userId: string; userName: string; title: string; description: string;
  type: string; hoursClaimed: number; collaborationBonus: number;
  status: string; evidenceUrl: string; submittedAt: string; ecAwarded: number;
  isFlaggedForAudit: boolean; adminNotes: string;
}
interface SafeUser {
  id: string; name: string; email: string; ecBalance: number;
  totalEcEarned: number; integrityMultiplier: number; auditViolations: number; avatarColor: string;
}
interface AdminStats {
  totalUsers: number; totalEcIssued: number; supplyUsedPct: number;
  pendingContributions: number; approvedContributions: number; totalRedemptions: number; maxSupply: number;
}
interface AdminRedemption {
  id: string; userName: string; rewardName: string; rewardIcon: string; ecSpent: number; status: string; redeemedAt: string;
}

const QUALITY_OPTS = [
  { value: 0.5, label: "0.5× — Poor" },
  { value: 1.0, label: "1.0× — Satisfactory" },
  { value: 1.2, label: "1.2× — Strong" },
  { value: 1.5, label: "1.5× — Exceptional" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"contributions"|"users"|"redemptions">("contributions");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ status: "approved", qualityFactor: 1.0, adminNotes: "", flagForAudit: false });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const checkAdmin = () => {
    const raw = localStorage.getItem("ec_user");
    if (!raw) { router.replace("/login"); return false; }
    const u = JSON.parse(raw);
    if (u.role !== "admin") { router.replace("/dashboard"); return false; }
    return true;
  };

  const loadAll = async () => {
    if (!checkAdmin()) return;
    const [c, u, r, s] = await Promise.all([
      api.get<Contribution[]>(`/api/contributions/all?status=${statusFilter}`),
      api.get<SafeUser[]>("/api/admin/users"),
      api.get<AdminRedemption[]>("/api/admin/redemptions"),
      api.get<AdminStats>("/api/admin/stats"),
    ]);
    setContributions(c); setUsers(u); setRedemptions(r); setStats(s);
  };

  useEffect(() => { loadAll(); }, [statusFilter]);

  const submitReview = async (id: string) => {
    setSubmitting(true);
    try {
      await api.put(`/api/contributions/${id}/review`, reviewForm);
      toast(`Contribution ${reviewForm.status}!`, "success");
      setReviewing(null);
      loadAll();
    } catch (err: unknown) { toast(err instanceof Error ? err.message : "Error", "error"); }
    finally { setSubmitting(false); }
  };

  const applyPenalty = async (userId: string, name: string) => {
    if (!confirm(`Apply 2-week 0.5× integrity penalty to ${name}?`)) return;
    try {
      await api.put(`/api/admin/users/${userId}/penalty`, {});
      toast(`Penalty applied to ${name}`, "success");
      loadAll();
    } catch { toast("Failed", "error"); }
  };

  const TABS = [
    { id: "contributions", label: "Contributions", icon: Zap },
    { id: "users", label: "Users", icon: Users },
    { id: "redemptions", label: "Redemptions", icon: ShoppingCart },
  ] as const;

  return (
    <div className="fade-up" style={{ padding: "32px 36px", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldCheck size={20} color="#f59e0b" />
        </div>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Review contributions · Manage users · Monitor platform</p>
        </div>
      </div>

      {/* Platform stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 26 }}>
          {[
            { l: "Total Users",   v: stats.totalUsers,            c: "#7c3aed" },
            { l: "EC Issued",     v: stats.totalEcIssued.toFixed(0), c: "#f59e0b" },
            { l: "Supply Used",   v: `${stats.supplyUsedPct}%`,   c: "#10b981" },
            { l: "Pending",       v: stats.pendingContributions,  c: "#f59e0b" },
            { l: "Redemptions",   v: stats.totalRedemptions,      c: "#a78bfa" },
          ].map(s => (
            <div key={s.l} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 22, border: "1px solid var(--border)" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 18px",
            borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
            background: tab === id ? "#f59e0b" : "transparent",
            color: tab === id ? "#0a0b12" : "var(--muted)",
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── CONTRIBUTIONS TAB ── */}
      {tab === "contributions" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["pending","approved","rejected"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={statusFilter === s ? "btn btn-primary" : "btn btn-ghost"}
                style={{ padding: "7px 16px", fontSize: 12, textTransform: "capitalize" }}>
                {s}
              </button>
            ))}
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            {contributions.length === 0
              ? <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>No {statusFilter} contributions.</div>
              : contributions.map(c => (
                <div key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <div style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</span>
                        <span className={`badge badge-${c.status}`}>{c.status}</span>
                        {c.isFlaggedForAudit && <span style={{ fontSize: 10, background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>AUDIT</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                        <span style={{ color: "var(--accent-2)", fontWeight: 600 }}>{c.userName}</span>
                        {" · "}{c.type} · {c.hoursClaimed}h
                        {c.collaborationBonus > 0 && ` · +${c.collaborationBonus} collab bonus`}
                        {" · "}{new Date(c.submittedAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 700 }}>{c.description}</div>
                      {c.evidenceUrl && (
                        <a href={c.evidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent-2)", display: "inline-block", marginTop: 6 }}>
                          View Evidence →
                        </a>
                      )}
                      {c.ecAwarded > 0 && (
                        <div className="font-mono" style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, marginTop: 6 }}>Awarded: +{c.ecAwarded} EC</div>
                      )}
                    </div>
                    {c.status === "pending" && (
                      <button className="btn btn-ghost" onClick={() => {
                        setReviewing(reviewing === c.id ? null : c.id);
                        setReviewForm({ status: "approved", qualityFactor: 1.0, adminNotes: "", flagForAudit: false });
                      }} style={{ flexShrink: 0, fontSize: 12, padding: "7px 14px" }}>
                        Review
                      </button>
                    )}
                  </div>

                  {/* Review form */}
                  {reviewing === c.id && (
                    <div style={{ padding: "16px 20px 20px", background: "rgba(124,58,237,0.04)", borderTop: "1px solid rgba(124,58,237,0.12)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <div>
                          <label className="label">Decision</label>
                          <select className="input" value={reviewForm.status} onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}>
                            <option value="approved">✅ Approve</option>
                            <option value="rejected">❌ Reject</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Quality Factor</label>
                          <select className="input" value={reviewForm.qualityFactor} onChange={e => setReviewForm({ ...reviewForm, qualityFactor: parseFloat(e.target.value) })}>
                            {QUALITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--muted)" }}>
                            <input type="checkbox" checked={reviewForm.flagForAudit}
                              onChange={e => setReviewForm({ ...reviewForm, flagForAudit: e.target.checked })}
                              style={{ accentColor: "#f43f5e" }} />
                            <AlertTriangle size={13} color="#f43f5e" />
                            Flag for audit (0.5× penalty)
                          </label>
                        </div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label className="label">Feedback for contributor</label>
                        <input className="input" placeholder="Great work on the implementation! / Needs more evidence..."
                          value={reviewForm.adminNotes} onChange={e => setReviewForm({ ...reviewForm, adminNotes: e.target.value })} />
                      </div>
                      {/* EC preview */}
                      {reviewForm.status === "approved" && (
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
                          EC Preview:{" "}
                          <span className="font-mono" style={{ color: "#f59e0b", fontWeight: 700 }}>
                            ~{Math.round((c.hoursClaimed * reviewForm.qualityFactor + c.collaborationBonus) * 100) / 100} EC
                          </span>
                          {reviewForm.flagForAudit && " × 0.5 penalty"}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => submitReview(c.id)} disabled={submitting}>
                          {submitting ? "Submitting..." : <><CheckCircle size={13} /> Submit Review</>}
                        </button>
                        <button className="btn btn-ghost" onClick={() => setReviewing(null)}>
                          <XCircle size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>EC Balance</th><th>Total Earned</th><th>Integrity</th><th>Violations</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: u.avatarColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "white" }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono" style={{ color: "#f59e0b", fontWeight: 600 }}>{u.ecBalance.toFixed(1)}</td>
                  <td className="font-mono" style={{ color: "#10b981", fontWeight: 600 }}>{u.totalEcEarned.toFixed(1)}</td>
                  <td className="font-mono" style={{ color: u.integrityMultiplier >= 1 ? "#10b981" : "#f43f5e", fontWeight: 700 }}>{u.integrityMultiplier}×</td>
                  <td className="font-mono" style={{ color: u.auditViolations > 0 ? "#f43f5e" : "var(--muted)" }}>{u.auditViolations}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => applyPenalty(u.id, u.name)} style={{ fontSize: 11, padding: "5px 12px" }}>
                      <AlertTriangle size={11} /> Penalty
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── REDEMPTIONS TAB ── */}
      {tab === "redemptions" && (
        <div className="card" style={{ overflow: "hidden" }}>
          {redemptions.length === 0
            ? <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>No redemptions yet.</div>
            : redemptions.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 24 }}>{r.rewardIcon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.userName}</span>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}> redeemed </span>
                  <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: 13 }}>{r.rewardName}</span>
                </div>
                <span className="font-mono" style={{ color: "#f43f5e", fontWeight: 700 }}>-{r.ecSpent} EC</span>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(r.redeemedAt).toLocaleDateString()}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
