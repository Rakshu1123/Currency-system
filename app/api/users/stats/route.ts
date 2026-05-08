import { NextRequest } from "next/server";
import { readDB } from "@/lib/db";
import { getTokenFromRequest, unauthorized } from "@/lib/auth";
import { getReputationScore, getWeeklyEarned, WEEKLY_CAP } from "@/lib/ec";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const db = readDB();
  const user = db.users.find(u => u.id === payload.sub);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  const myContribs = db.contributions.filter(c => c.userId === payload.sub);
  const pending = myContribs.filter(c => c.status === "pending").length;
  const approved = myContribs.filter(c => c.status === "approved").length;
  const weeklyEarned = getWeeklyEarned(db.contributions, payload.sub);

  const allUsers = db.users.filter(u => u.role === "user").sort((a, b) => b.totalEcEarned - a.totalEcEarned);
  const rank = allUsers.findIndex(u => u.id === payload.sub) + 1;

  // Build last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en", { weekday: "short" });
    const ec = myContribs
      .filter(c => c.status === "approved" && c.reviewedAt?.startsWith(dayStr))
      .reduce((s, c) => s + c.ecAwarded, 0);
    return { day: dayLabel, ec };
  });

  return Response.json({
    ecBalance: user.ecBalance,
    totalEcEarned: user.totalEcEarned,
    totalEcRedeemed: user.totalEcRedeemed,
    reputationScore: getReputationScore(user),
    integrityMultiplier: user.integrityMultiplier,
    pendingContributions: pending,
    approvedContributions: approved,
    weeklyEcEarned: weeklyEarned,
    weeklyCap: WEEKLY_CAP,
    rank: rank || allUsers.length + 1,
    totalUsers: allUsers.length,
    chartData,
  });
}
