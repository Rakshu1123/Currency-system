import { NextRequest } from "next/server";
import { readDB } from "@/lib/db";
import { getTokenFromRequest, unauthorized, forbidden } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  if (payload.role !== "admin") return forbidden();
  const db = readDB();
  return Response.json(
    db.redemptions
      .sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt))
      .map(r => {
        const user = db.users.find(u => u.id === r.userId);
        const reward = db.rewards.find(rw => rw.id === r.rewardId);
        return { ...r, userName: user?.name ?? "?", rewardName: reward?.name ?? "?", rewardIcon: reward?.icon ?? "🎁" };
      })
  );
}
