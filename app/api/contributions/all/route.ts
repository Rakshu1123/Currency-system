import { NextRequest } from "next/server";
import { readDB } from "@/lib/db";
import { getTokenFromRequest, unauthorized, forbidden } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return unauthorized();
  if (payload.role !== "admin") return forbidden();
  const db = readDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let contribs = db.contributions;
  if (status) contribs = contribs.filter(c => c.status === status);
  contribs = contribs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return Response.json(contribs.map(c => {
    const user = db.users.find(u => u.id === c.userId);
    return { ...c, userName: user?.name ?? "Unknown" };
  }));
}
