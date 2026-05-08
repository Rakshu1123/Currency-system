import { NextRequest } from "next/server";
import { readDB, writeDB, toSafeUser } from "@/lib/db";
import { getTokenFromRequest, unauthorized, forbidden } from "@/lib/auth";
import { applyAuditPenalty } from "@/lib/ec";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  if (payload.role !== "admin") return forbidden();
  const { id } = await params;
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return Response.json({ error: "User not found" }, { status: 404 });
  db.users[idx] = applyAuditPenalty(db.users[idx]);
  writeDB(db);
  return Response.json(toSafeUser(db.users[idx]));
}
