import { NextRequest } from "next/server";
import { readDB, toSafeUser } from "@/lib/db";
import { getTokenFromRequest, unauthorized, forbidden } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  if (payload.role !== "admin") return forbidden();
  const db = readDB();
  return Response.json(db.users.filter(u => u.role === "user").map(toSafeUser));
}
