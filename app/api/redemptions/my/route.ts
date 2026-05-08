import { NextRequest } from "next/server";
import { readDB } from "@/lib/db";
import { getTokenFromRequest, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const db = readDB();
  const items = db.redemptions
    .filter(r => r.userId === payload.sub)
    .sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt))
    .map(r => {
      const reward = db.rewards.find(rw => rw.id === r.rewardId);
      return { ...r, rewardName: reward?.name ?? "Unknown", rewardIcon: reward?.icon ?? "🎁" };
    });
  return Response.json(items);
}
