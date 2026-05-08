import { NextRequest } from "next/server";
import { readDB, writeDB, makeId } from "@/lib/db";
import { getTokenFromRequest, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const { rewardId } = await req.json();
  const db = readDB();
  const rIdx = db.rewards.findIndex(r => r.id === rewardId);
  if (rIdx === -1 || !db.rewards[rIdx].isActive)
    return Response.json({ error: "Reward not found" }, { status: 404 });
  const reward = db.rewards[rIdx];
  if (reward.stock === 0)
    return Response.json({ error: "Out of stock" }, { status: 400 });
  const uIdx = db.users.findIndex(u => u.id === payload.sub);
  if (db.users[uIdx].ecBalance < reward.ecCost)
    return Response.json({ error: `Need ${reward.ecCost} EC, you have ${db.users[uIdx].ecBalance.toFixed(1)}` }, { status: 400 });

  db.users[uIdx].ecBalance = Math.round((db.users[uIdx].ecBalance - reward.ecCost) * 100) / 100;
  db.users[uIdx].totalEcRedeemed = Math.round((db.users[uIdx].totalEcRedeemed + reward.ecCost) * 100) / 100;
  if (reward.stock > 0) db.rewards[rIdx].stock -= 1;

  const redemption = {
    id: makeId(), userId: payload.sub, rewardId,
    ecSpent: reward.ecCost, status: "pending" as const,
    redeemedAt: new Date().toISOString(),
  };
  db.redemptions.push(redemption);
  writeDB(db);
  return Response.json({ ...redemption, rewardName: reward.name, rewardIcon: reward.icon }, { status: 201 });
}
