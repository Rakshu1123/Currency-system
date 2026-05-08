"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/components/Toaster";
import { Edit3, Save, X, Star, Zap, TrendingUp, ShieldCheck, Award } from "lucide-react";

interface SafeUser {
  id: string; name: string; email: string; role: string;
  ecBalance: number; totalEcEarned: number; totalEcRedeemed: number;
  reputationScore: number; integrityMultiplier: number;
  integrityPenaltyUntil: string | null; auditViolations: number;
  avatarColor: string; bio: string; createdAt: string;
}
interface Contribution {
  id: string; title: string; type: string; hoursClaimed: number;
  status: string; ecAwarded: number; adminNotes: string; submittedAt: string;
}

const COLORS = ["#7c3aed","#a78bfa","#3b82f6","#10b981","#f59e0b","#ec4899","#f43f5e","#14b8a6","#6366f1"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<SafeUser | null>(null);
  const [contribs, setContribs] = useState<Contribution[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", avatarColor: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all"|"pending"|"approved"|"rejected">("all");

  useEffect(() => {
    Promise.all([api.get<SafeUser>("/api/users/me"), api.get<Contribution[]>("/api/contributions")])
      .then(([p, c]) => {
        setProfile(p);
        setForm({ name: p.name, bio: p.bio || "", avatarColor: p.avatarColor });
        setContribs(c);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.put<SafeUser>("/api/users/me", form);
      setProfile(updated);
      setEditing(false);
      // sync sidebar
      const raw = localStorage.getItem("ec_user");
      if (raw) {
        const u = JSON.parse(raw);
        localStorage.setItem("ec_user", JSON.stringify({ ...u, name: updated.name, avatarColor: updated.avatarColor }));
        window.dispatchEvent(new Event("ec-balance-updated"));
      }
      toast("Profile updated!", "success");
    } catch { toast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  if (!profile) return (
    <div style={{ padding: "40px 36px" }}>
      {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 80, borderRadius: 12, marginBottom: 14 }} />)}
    </div>
  );

  const statusCounts = { pending: 0, approved: 0, rejected: 0 } as Record<string, number>;
  contribs.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" });
  const filtered = filter === "all" ? contribs : contribs.filter(c => c.status === filter);

  return (
    <div className="fade-up" style={{ padding: "32px 36px", maxWidth: 1040 }}>
      <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 28 }}>My Profile</h1>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Profile card */}
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: "0 auto 14px",
              background: form.avatarColor, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "white",
              boxShadow: `0 0 28px ${form.avatarColor}50`,
            }}>
              {profile.name[0].toUpperCase()}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                <div>
                  <label className="label">Display Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea className="input" style={{ minHeight: 80, resize: "none" }} placeholder="Short bio..."
                    value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div>
                  <label className="label">Avatar Color</label>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {COLORS.map(c => (
                      <div key={c} onClick={() => setForm({ ...form, avatarColor: c })} style={{
                        width: 26, height: 26, borderRadius: 7, background: c, cursor: "pointer", transition: "all 0.15s",
                        border: form.avatarColor === c ? "2px solid white" : "2px solid transparent",
                        boxShadow: form.avatarColor === c ? `0 0 10px ${c}80` : "none",
                      }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button className="btn btn-primary" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                    <Save size={13} /> {saving ? "..." : "Save"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setEditing(false)} style={{ flex: 1, justifyContent: "center" }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{profile.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{profile.email}</div>
                {profile.bio && <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 10 }}>{profile.bio}</div>}
                <div style={{ fontSize: 11, color: "var(--accent-2)", marginBottom: 12 }}>Member since {memberSince}</div>
                {/* Stars */}
                <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill={profile.reputationScore >= s ? "#f59e0b" : "none"} color={profile.reputationScore >= s ? "#f59e0b" : "#374151"} />
                  ))}
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>{profile.reputationScore.toFixed(1)}</span>
                </div>
                <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
                  <Edit3 size={13} /> Edit Profile
                </button>
              </>
            )}
          </div>

          {/* EC Stats */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>EC Statistics</div>
            {[
              { icon: <Zap size={13} />,         label: "Balance",      value: `${profile.ecBalance.toFixed(1)} EC`,      color: "#f59e0b" },
              { icon: <TrendingUp size={13} />,   label: "Total Earned", value: `${profile.totalEcEarned.toFixed(1)} EC`,  color: "#10b981" },
              { icon: <Award size={13} />,        label: "Total Redeemed",value: `${profile.totalEcRedeemed.toFixed(1)} EC`, color: "#7c3aed" },
              { icon: <ShieldCheck size={13} />,  label: "Integrity",    value: `${profile.integrityMultiplier}×`,         color: profile.integrityMultiplier >= 1 ? "#10b981" : "#f43f5e" },
              { icon: <X size={13} />,            label: "Violations",   value: String(profile.auditViolations),           color: profile.auditViolations > 0 ? "#f43f5e" : "var(--muted)" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--muted)" }}>{s.icon}{s.label}</span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Summary boxes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[["Pending","pending","#f59e0b"],["Approved","approved","#10b981"],["Rejected","rejected","#f43f5e"]].map(([l,k,c]) => (
              <div key={k} style={{ background: `${c}0d`, border: `1px solid ${c}25`, borderRadius: 10, padding: "12px 10px", textAlign: "center", cursor: "pointer" }}
                onClick={() => setFilter(filter === k ? "all" : k as "pending"|"approved"|"rejected")}>
                <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: c as string }}>{statusCounts[k]}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - contribution history */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <span className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>
              Contribution History ({filtered.length})
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {(["all","pending","approved","rejected"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                  background: filter === f ? "var(--accent)" : "var(--surface)",
                  color: filter === f ? "white" : "var(--muted)",
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 580, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                No {filter === "all" ? "" : filter} submissions yet.
              </div>
            ) : filtered.map(c => (
              <div key={c.id} style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                  background: c.status === "approved" ? "#10b981" : c.status === "pending" ? "#f59e0b" : "#f43f5e",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    <span style={{ textTransform: "capitalize" }}>{c.type}</span> · {c.hoursClaimed}h · {new Date(c.submittedAt).toLocaleDateString()}
                  </div>
                  {c.adminNotes && (
                    <div style={{ fontSize: 12, color: "var(--accent-2)", marginTop: 5, fontStyle: "italic" }}>
                      Admin: "{c.adminNotes}"
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                  {c.ecAwarded > 0 && (
                    <span className="font-mono" style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>+{c.ecAwarded} EC</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
