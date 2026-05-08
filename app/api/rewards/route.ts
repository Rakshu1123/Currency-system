import { readDB } from "@/lib/db";

export async function GET() {
  const db = readDB();
  const rewards = db.rewards
    .filter(r => r.isActive)
    .sort((a, b) => a.tier - b.tier || a.ecCost - b.ecCost);
  return Response.json(rewards);
}
