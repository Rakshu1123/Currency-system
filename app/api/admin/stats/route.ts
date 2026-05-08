import { NextRequest } from "next/server";
import { readDB } from "@/lib/db";
import { getTokenFromRequest, unauthorized, forbidden } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  if (payload.role !== "admin") return forbidden();
  const db = readDB();
  const users = db.users.filter(u => u.role === "user");
  const totalEcIssued = users.reduce((s, u) => s + u.totalEcEarned, 0);
  return Response.json({
    totalUsers: users.length,
    totalEcIssued: Math.round(totalEcIssued * 100) / 100,
    supplyUsedPct: Math.round((totalEcIssued / 144000) * 10000) / 100,
    pendingContributions: db.contributions.filter(c => c.status === "pending").length,
    approvedContributions: db.contributions.filter(c => c.status === "approved").length,
    totalRedemptions: db.redemptions.length,
    maxSupply: 144000,
  });
}
