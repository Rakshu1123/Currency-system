import { NextRequest } from "next/server";
import { readDB, writeDB, makeId } from "@/lib/db";
import { getTokenFromRequest, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const db = readDB();
  const contribs = db.contributions
    .filter(c => c.userId === payload.sub)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map(c => {
      const user = db.users.find(u => u.id === c.userId);
      return { ...c, userName: user?.name ?? "Unknown" };
    });
  return Response.json(contribs);
}

export async function POST(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const { title, description, type, hoursClaimed, evidenceUrl, collaborationBonus } = await req.json();
  if (!title || !description || !type || !hoursClaimed) return Response.json({ error: "Missing fields" }, { status: 400 });
  if (hoursClaimed <= 0 || hoursClaimed > 12) return Response.json({ error: "Hours must be 0.5–12" }, { status: 400 });

  const db = readDB();
  const contrib = {
    id: makeId(), userId: payload.sub, title, description, type,
    hoursClaimed: parseFloat(hoursClaimed),
    qualityFactor: null, collaborationBonus: parseFloat(collaborationBonus) || 0,
    ecAwarded: 0, status: "pending" as const, adminNotes: "",
    evidenceUrl: evidenceUrl || "", isFlaggedForAudit: false,
    submittedAt: new Date().toISOString(), reviewedAt: null,
  };
  db.contributions.push(contrib);
  writeDB(db);
  const user = db.users.find(u => u.id === payload.sub);
  return Response.json({ ...contrib, userName: user?.name ?? "" }, { status: 201 });
}
