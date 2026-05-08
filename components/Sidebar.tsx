"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Zap, Trophy, Gift, User, ShieldCheck, LogOut, Coins, TrendingUp } from "lucide-react";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/contribute",  label: "Contribute",  icon: Zap },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/store",       label: "Redeem Store",icon: Gift },
  { href: "/profile",     label: "My Profile",  icon: User },
];

interface Props { userName: string; ecBalance: number; role: string; avatarColor: string; }

export default function Sidebar({ userName, ecBalance, role, avatarColor }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("ec_token");
    localStorage.removeItem("ec_user");
    router.push("/login");
  };

  return (
    <aside style={{
      width: 232, minHeight: "100vh", flexShrink: 0,
      background: "rgba(13,17,23,0.95)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "20px 12px",
      position: "sticky", top: 0, backdropFilter: "blur(20px)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 24px" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(124,58,237,0.4)",
        }}>
          <Coins size={16} color="white" />
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>EC Platform</div>
          <div style={{ fontSize: 9, color: "var(--accent-2)", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>CHIAC ASI</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`}>
              <Icon size={16} />
              <span>{label}</span>
              {active && (
                <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--accent-2)" }} />
              )}
            </Link>
          );
        })}

        {role === "admin" && (
          <>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            <Link href="/admin" className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
              style={{ color: pathname === "/admin" ? "#f59e0b" : undefined }}>
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      {/* EC Balance pill */}
      <div style={{
        margin: "12px 4px 8px", padding: "10px 14px", borderRadius: 10,
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <TrendingUp size={13} color="#f59e0b" />
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Balance</span>
        <span className="font-mono" style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>
          {ecBalance.toFixed(1)} EC
        </span>
      </div>

      {/* User + Logout */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 10px" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: avatarColor, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, color: "white",
          }}>
            {userName[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "capitalize" }}>{role}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 13, padding: "8px" }}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
