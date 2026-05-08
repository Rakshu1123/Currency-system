import { NextRequest } from "next/server";
import { readDB, writeDB, toSafeUser } from "@/lib/db";
import { getTokenFromRequest, unauthorized } from "@/lib/auth";
import { getReputationScore } from "@/lib/ec";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const db = readDB();
  const user = db.users.find(u => u.id === payload.sub);
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  user.reputationScore = getReputationScore(user);
  return Response.json(toSafeUser(user));
}

export async function PUT(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  const { name, bio, avatarColor } = await req.json();
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === payload.sub);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  if (name) db.users[idx].name = name;
  if (bio !== undefined) db.users[idx].bio = bio;
  if (avatarColor) db.users[idx].avatarColor = avatarColor;
  writeDB(db);
  return Response.json(toSafeUser(db.users[idx]));
}
