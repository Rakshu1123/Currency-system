"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Star } from "lucide-react";

interface Entry { rank: number; userId: string; name: string; ecBalance: number; totalEcEarned: number; reputationScore: number; avatarColor: string; }

export default function LeaderboardPage() {
  const [data, setData] = useState<Entry[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("ec_user");
    if (raw) setMyId(JSON.parse(raw).id);
    api.get<Entry[]>("/api/leaderboard").then(d => { setData(d); setLoading(false); });
  }, []);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = [80, 110, 60];
  const podiumRanks = [2, 1, 3];
  const podiumEmoji = ["🥈", "🥇", "🥉"];

  return (
    <div className="fade-up" style={{ padding: "32px 36px", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Leaderboard</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Top contributors ranked by total EC earned · Live public ledger</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="shimmer" style={{ height: 58, borderRadius: 12 }} />)}
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 14, marginBottom: 32 }}>
              {podiumOrder.map((entry, idx) => {
                const isMe = entry.userId === myId;
                return (
                  <div key={entry.userId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div className="card" style={{
                      width: 150, padding: "20px 16px", textAlign: "center",
                      border: isMe ? "1px solid rgba(124,58,237,0.5)" : undefined,
                      boxShadow: podiumRanks[idx] === 1 ? "0 0 30px rgba(245,158,11,0.15)" : undefined,
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 10 }}>{podiumEmoji[idx]}</div>
                      <div style={{
                        width: 46, height: 46, borderRadius: 12, margin: "0 auto 10px",
                        background: entry.avatarColor, display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 18, color: "white",
                        boxShadow: podiumRanks[idx] === 1 ? `0 0 20px ${entry.avatarColor}60` : undefined,
                      }}>
                        {entry.name[0].toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                        {entry.name.split(" ")[0]} {isMe && <span style={{ color: "var(--accent-2)" }}>(You)</span>}
                      </div>
                      <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", marginBottom: 6 }}>
                        {entry.totalEcEarned.toFixed(0)}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 8 }}>EC earned</div>
                      <Stars score={entry.reputationScore} />
                    </div>
                    <div style={{
                      width: 150, height: podiumHeights[idx], borderRadius: "8px 8px 0 0",
                      background: podiumRanks[idx] === 1 ? "linear-gradient(180deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))"
                        : podiumRanks[idx] === 2 ? "linear-gradient(180deg, rgba(148,163,184,0.15), rgba(148,163,184,0.03))"
                        : "linear-gradient(180deg, rgba(205,124,46,0.15), rgba(205,124,46,0.03))",
                      border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.08)" }}>
                        #{podiumRanks[idx]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Contributor</th>
                  <th>EC Balance</th>
                  <th>Total Earned</th>
                  <th>Reputation</th>
                </tr>
              </thead>
              <tbody>
                {rest.map(e => {
                  const isMe = e.userId === myId;
                  return (
                    <tr key={e.userId} style={{ background: isMe ? "rgba(124,58,237,0.05)" : undefined }}>
                      <td className="font-mono" style={{ color: "var(--muted)", fontWeight: 700 }}>#{e.rank}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: e.avatarColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "white" }}>
                            {e.name[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: isMe ? "var(--accent-2)" : "var(--text)" }}>
                            {e.name} {isMe && "(You)"}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono" style={{ color: "#f59e0b", fontWeight: 600 }}>{e.ecBalance.toFixed(1)}</td>
                      <td className="font-mono" style={{ color: "#10b981", fontWeight: 600 }}>{e.totalEcEarned.toFixed(0)}</td>
                      <td><Stars score={e.reputationScore} /></td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>No contributors yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stars({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={11} fill={score >= s ? "#f59e0b" : "none"} color={score >= s ? "#f59e0b" : "#374151"} />
      ))}
    </div>
  );
}
