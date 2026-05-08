"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/components/Toaster";
import { Send, Info, CheckCircle } from "lucide-react";

const TYPES = [
  { id: "task",          label: "Task Completion",  icon: "⚡", color: "#7c3aed", desc: "Assigned work, projects, deliverables" },
  { id: "learning",      label: "Learning & Skills", icon: "📚", color: "#3b82f6", desc: "Courses, docs, assessments (10 EC weekly cap)" },
  { id: "collaboration", label: "Helping Others",    icon: "🤝", color: "#10b981", desc: "Mentoring peers, pair programming, reviews" },
  { id: "community",     label: "Community Work",    icon: "🌐", color: "#f59e0b", desc: "Events, volunteering, knowledge sharing" },
  { id: "research",      label: "Research",          icon: "🔬", color: "#ec4899", desc: "Papers, experiments, published findings" },
];

const QUALITY_GUIDE = [
  { label: "Poor",        mult: "0.5×", color: "#f43f5e" },
  { label: "Satisfactory",mult: "1.0×", color: "#6b7280" },
  { label: "Strong",      mult: "1.2×", color: "#10b981" },
  { label: "Exceptional", mult: "1.5×", color: "#f59e0b" },
];

export default function ContributePage() {
  const [form, setForm] = useState({ title: "", description: "", type: "task", hoursClaimed: "", evidenceUrl: "", collaborationBonus: "0" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(form.hoursClaimed);
    if (!h || h <= 0 || h > 12) return toast("Hours must be 0.5–12", "error");
    setLoading(true);
    try {
      await api.post("/api/contributions", { ...form, hoursClaimed: h, collaborationBonus: parseFloat(form.collaborationBonus) || 0 });
      toast("Contribution submitted! Pending admin review.", "success");
      setDone(true);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div className="card fade-up" style={{ padding: 48, textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Submitted!</h2>
        <p style={{ color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>Your contribution is pending admin review. You'll earn EC once approved.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => setDone(false)}>Submit Another</button>
          <a href="/dashboard" className="btn btn-ghost">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );

  const selectedType = TYPES.find(t => t.id === form.type)!;

  return (
    <div className="fade-up" style={{ padding: "32px 36px", maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Submit Contribution</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Log verified work to earn Energy Credits</p>
      </div>

      {/* Formula banner */}
      <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 12, padding: "13px 18px", marginBottom: 24, display: "flex", gap: 10 }}>
        <Info size={15} color="var(--accent-2)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--accent-2)", fontWeight: 600 }}>EC Formula: </span>
          (Hours × Quality Factor) + Collaboration Bonus × Integrity Multiplier
          &nbsp;·&nbsp;Weekly cap: <strong style={{ color: "var(--text)" }}>40 EC</strong>
          &nbsp;·&nbsp;Quality set by admin after review
        </div>
      </div>

      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
          {/* Type selector */}
          <div>
            <label className="label">Contribution Type</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TYPES.map(t => (
                <label key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 11, cursor: "pointer", transition: "all 0.15s",
                  border: `1px solid ${form.type === t.id ? t.color + "50" : "var(--border)"}`,
                  background: form.type === t.id ? `${t.color}10` : "var(--surface)",
                }}>
                  <input type="radio" name="type" value={t.id} checked={form.type === t.id}
                    onChange={e => setForm({ ...form, type: e.target.value })} style={{ display: "none" }} />
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.type === t.id ? "var(--text)" : "var(--muted)" }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{t.desc}</div>
                  </div>
                  {form.type === t.id && <CheckCircle size={14} color={t.color} style={{ marginLeft: "auto" }} />}
                </label>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="label">Title *</label>
              <input className="input" placeholder={`e.g. ${selectedType.icon} Built REST API for user auth module`}
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea className="input" style={{ minHeight: 120, resize: "vertical" }}
                placeholder="Describe what you did, the outcome, and how it adds value to the team..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="label">Hours Claimed *</label>
                <input className="input" type="number" min="0.5" max="12" step="0.5" placeholder="e.g. 3"
                  value={form.hoursClaimed} onChange={e => setForm({ ...form, hoursClaimed: e.target.value })} required />
              </div>
              <div>
                <label className="label">Collaboration Bonus EC</label>
                <input className="input" type="number" min="0" step="0.5" placeholder="0"
                  value={form.collaborationBonus} onChange={e => setForm({ ...form, collaborationBonus: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Evidence URL (optional)</label>
              <input className="input" placeholder="https://github.com/... or Google Drive link"
                value={form.evidenceUrl} onChange={e => setForm({ ...form, evidenceUrl: e.target.value })} />
            </div>

            {/* Quality reference */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Quality Multiplier (set by admin)</div>
              <div style={{ display: "flex", gap: 10 }}>
                {QUALITY_GUIDE.map(q => (
                  <div key={q.label} style={{ flex: 1, textAlign: "center", padding: "8px 6px", borderRadius: 8, background: `${q.color}0d`, border: `1px solid ${q.color}20` }}>
                    <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: q.color }}>{q.mult}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{q.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ justifyContent: "center", padding: "13px", fontSize: 15 }}>
              {loading ? "Submitting..." : <><Send size={15} /> Submit for Review</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
