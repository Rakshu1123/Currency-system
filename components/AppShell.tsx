"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

interface StoredUser { id: string; name: string; role: string; ecBalance: number; avatarColor: string; }

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("ec_user");
    const token = localStorage.getItem("ec_token");
    if (!raw || !token) { router.replace("/login"); return; }
    try { setUser(JSON.parse(raw)); } catch { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  // keep ecBalance in sync after any page action
  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem("ec_user");
      if (raw) try { setUser(JSON.parse(raw)); } catch {}
    };
    window.addEventListener("ec-balance-updated", sync);
    return () => window.removeEventListener("ec-balance-updated", sync);
  }, []);

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        userName={user!.name}
        ecBalance={user!.ecBalance}
        role={user!.role}
        avatarColor={user!.avatarColor}
      />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
