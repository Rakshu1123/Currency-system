import { NextRequest } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getTokenFromRequest, unauthorized, forbidden } from "@/lib/auth";
import { calculateEC, applyAuditPenalty, checkAndRestoreIntegrity, getWeeklyEarned, WEEKLY_CAP } from "@/lib/ec";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  if (payload.role !== "admin") return forbidden();

  const { id } = await params;
  const { status, qualityFactor, adminNotes, flagForAudit } = await req.json();
  const db = readDB();

  const cIdx = db.contributions.findIndex(c => c.id === id);
  if (cIdx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  if (db.contributions[cIdx].status !== "pending") return Response.json({ error: "Already reviewed" }, { status: 400 });

  db.contributions[cIdx].status = status;
  db.contributions[cIdx].qualityFactor = qualityFactor ?? 1.0;
  db.contributions[cIdx].adminNotes = adminNotes ?? "";
  db.contributions[cIdx].reviewedAt = new Date().toISOString();
  db.contributions[cIdx].isFlaggedForAudit = !!flagForAudit;

  if (status === "approved") {
    const uIdx = db.users.findIndex(u => u.id === db.contributions[cIdx].userId);
    if (uIdx !== -1) {
      db.users[uIdx] = checkAndRestoreIntegrity(db.users[uIdx]);
      const weeklyEarned = getWeeklyEarned(db.contributions, db.users[uIdx].id);
      const remaining = Math.max(0, WEEKLY_CAP - weeklyEarned);
      const ec = calculateEC(
        db.contributions[cIdx].hoursClaimed,
        qualityFactor ?? 1.0,
        db.contributions[cIdx].collaborationBonus,
        db.users[uIdx].integrityMultiplier,
        db.contributions[cIdx].type
      );
      const awarded = Math.min(ec, remaining);
      db.contributions[cIdx].ecAwarded = awarded;
      db.users[uIdx].ecBalance = Math.round((db.users[uIdx].ecBalance + awarded) * 100) / 100;
      db.users[uIdx].totalEcEarned = Math.round((db.users[uIdx].totalEcEarned + awarded) * 100) / 100;
    }
  }

  if (flagForAudit) {
    const uIdx = db.users.findIndex(u => u.id === db.contributions[cIdx].userId);
    if (uIdx !== -1) db.users[uIdx] = applyAuditPenalty(db.users[uIdx]);
  }

  writeDB(db);
  const user = db.users.find(u => u.id === db.contributions[cIdx].userId);
  return Response.json({ ...db.contributions[cIdx], userName: user?.name ?? "" });
}
