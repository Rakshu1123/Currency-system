"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export interface Toast { id: string; message: string; type: "success" | "error"; }

let _setToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function toast(message: string, type: "success" | "error" = "success") {
  if (!_setToasts) return;
  const id = Math.random().toString(36).slice(2);
  _setToasts(prev => [...prev, { id, message, type }]);
  setTimeout(() => _setToasts!(prev => prev.filter(t => t.id !== id)), 3500);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className="fade-up" style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          borderRadius: 10, minWidth: 260, maxWidth: 380,
          background: "rgba(13,17,23,0.98)", backdropFilter: "blur(20px)",
          border: `1px solid ${t.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          fontFamily: "'Outfit', sans-serif", fontSize: 14,
        }}>
          {t.type === "success"
            ? <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
            : <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0 }} />
          }
          <span style={{ flex: 1, color: "var(--text)" }}>{t.message}</span>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
