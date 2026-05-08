import { readDB } from "@/lib/db";
import { getReputationScore } from "@/lib/ec";

export async function GET() {
  const db = readDB();
  const ranked = db.users
    .filter(u => u.role === "user")
    .sort((a, b) => b.totalEcEarned - a.totalEcEarned)
    .slice(0, 50)
    .map((u, i) => ({
      rank: i + 1, userId: u.id, name: u.name,
      ecBalance: u.ecBalance, totalEcEarned: u.totalEcEarned,
      reputationScore: getReputationScore(u), avatarColor: u.avatarColor,
    }));
  return Response.json(ranked);
}
