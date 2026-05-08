"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/components/Toaster";
import { ShoppingBag, Clock, Coins } from "lucide-react";

interface Reward { id: string; name: string; description: string; tier: 1|2|3; ecCost: number; stock: number; category: string; icon: string; }
interface Redemption { id: string; rewardName: string; rewardIcon: string; ecSpent: number; status: string; redeemedAt: string; }

const TIER = { 1: { label: "Tier 1 — Entry Level", color: "#10b981" }, 2: { label: "Tier 2 — Mid Level", color: "#7c3aed" }, 3: { label: "Tier 3 — Premium", color: "#f59e0b" } };

export default function StorePage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [ecBalance, setEcBalance] = useState(0);
  const [tab, setTab] = useState<"store" | "history">("store");
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const loadData = async () => {
    const raw = localStorage.getItem("ec_user");
    if (raw) setEcBalance(JSON.parse(raw).ecBalance ?? 0);
    const [r, m] = await Promise.all([api.get<Reward[]>("/api/rewards"), api.get<Redemption[]>("/api/redemptions/my")]);
    setRewards(r); setRedemptions(m); setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const redeem = async (reward: Reward) => {
    if (ecBalance < reward.ecCost) return toast(`Need ${reward.ecCost} EC — you have ${ecBalance.toFixed(1)}`, "error");
    setRedeeming(reward.id);
    try {
      await api.post("/api/redemptions", { rewardId: reward.id });
      toast(`Redeemed: ${reward.name}!`, "success");
      // update stored user balance
      const raw = localStorage.getItem("ec_user");
      if (raw) {
        const u = JSON.parse(raw);
        u.ecBalance = Math.round((u.ecBalance - reward.ecCost) * 100) / 100;
        localStorage.setItem("ec_user", JSON.stringify(u));
        window.dispatchEvent(new Event("ec-balance-updated"));
        setEcBalance(u.ecBalance);
      }
      loadData();
    } catch (err: unknown) { toast(err instanceof Error ? err.message : "Failed", "error"); }
    finally { setRedeeming(null); }
  };

  const byTier = ([1, 2, 3] as const).map(t => ({ tier: t, items: rewards.filter(r => r.tier === t) }));

  return (
    <div className="fade-up" style={{ padding: "32px 36px", maxWidth: 1040 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Redemption Store</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Spend your earned EC on real rewards</p>
        </div>
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <Coins size={15} color="#f59e0b" />
          <span className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>{ecBalance.toFixed(1)}</span>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>EC available</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 28, border: "1px solid var(--border)" }}>
        {[["store", "Store", ShoppingBag], ["history", "My Redemptions", Clock]].map(([id, label, Icon]) => (
          <button key={id as string} onClick={() => setTab(id as "store" | "history")} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 18px",
            borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
            background: tab === id ? "#7c3aed" : "transparent",
            color: tab === id ? "white" : "var(--muted)",
          }}>
            {/* @ts-ignore */}
            <Icon size={13} /> {label as string}
          </button>
        ))}
      </div>

      {loading ? <div className="shimmer" style={{ height: 200, borderRadius: 14 }} /> :
        tab === "store" ? (
          byTier.map(({ tier, items }) => items.length > 0 && (
            <div key={tier} style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 24, height: 2, background: TIER[tier].color, borderRadius: 1 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: TIER[tier].color, textTransform: "uppercase", letterSpacing: 1 }}>
                  {TIER[tier].label}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {items.map(r => {
                  const canAfford = ecBalance >= r.ecCost;
                  const outOfStock = r.stock === 0;
                  return (
                    <div key={r.id} className="card card-glow" style={{ padding: 20, display: "flex", flexDirection: "column", opacity: outOfStock ? 0.5 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <span style={{ fontSize: 32 }}>{r.icon}</span>
                        {r.stock > 0 && r.stock <= 3 && (
                          <span style={{ fontSize: 10, background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>
                            {r.stock} left
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{r.description}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: canAfford ? "#f59e0b" : "#f43f5e" }}>
                          {r.ecCost} EC
                        </span>
                        <button className="btn btn-primary" onClick={() => redeem(r)}
                          disabled={!canAfford || outOfStock || redeeming === r.id}
                          style={{ padding: "7px 14px", fontSize: 12 }}>
                          {outOfStock ? "Sold Out" : redeeming === r.id ? "..." : "Redeem"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            {redemptions.length === 0
              ? <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>No redemptions yet.</div>
              : redemptions.map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 26 }}>{r.rewardIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.rewardName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{new Date(r.redeemedAt).toLocaleDateString()}</div>
                  </div>
                  <span className="font-mono" style={{ color: "#f43f5e", fontWeight: 700 }}>-{r.ecSpent} EC</span>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
}
