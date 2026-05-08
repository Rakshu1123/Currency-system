"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coins, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "@/components/Toaster";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("ec_token")) router.replace("/dashboard");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      localStorage.setItem("ec_token", data.token);
      localStorage.setItem("ec_user", JSON.stringify(data.user));
      toast(mode === "login" ? "Welcome back!" : "Account created!", "success");
      setTimeout(() => router.push("/dashboard"), 400);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <Toaster />

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(124,58,237,0.35)",
          }}>
            <Coins size={24} color="white" />
          </div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>EC Platform</h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>CHIAC ASI · Superintelligence Edge Project</p>
        </div>

        {/* Demo credentials */}
        <div style={{
          background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)",
          borderRadius: 12, padding: "12px 16px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: "var(--accent-2)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 7 }}>Demo Credentials</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
            User: <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>demo@ec.platform</span> / <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>demo123</span><br />
            Admin: <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>admin@ec.platform</span> / <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>admin123</span>
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tab toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, marginBottom: 28, border: "1px solid var(--border)" }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "white" : "var(--muted)",
              }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                  <input className="input" style={{ paddingLeft: 38 }} placeholder="Your full name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                <input className="input" style={{ paddingLeft: 38 }} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                <input className="input" style={{ paddingLeft: 38, paddingRight: 40 }} type={showPw ? "text" : "password"}
                  placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex",
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 4, fontSize: 15 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Please wait...
                </span>
              ) : (
                <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--muted)" }}>
          Contribution Economy · Energy Credits · CHIAC 2026
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
