import { NextRequest } from "next/server";
import { ensureDB, writeDB, toSafeUser } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";
import { checkAndRestoreIntegrity, getReputationScore } from "@/lib/ec";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ error: "Email and password required" }, { status: 400 });

    const db = await ensureDB();
    const userIdx = db.users.findIndex(u => u.email === email);
    if (userIdx === -1) return Response.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await verifyPassword(password, db.users[userIdx].passwordHash);
    if (!ok) return Response.json({ error: "Invalid credentials" }, { status: 401 });

    // restore integrity if penalty expired
    db.users[userIdx] = checkAndRestoreIntegrity(db.users[userIdx]);
    db.users[userIdx].reputationScore = getReputationScore(db.users[userIdx]);
    writeDB(db);

    const user = db.users[userIdx];
    const token = signToken({ sub: user.id, role: user.role, name: user.name });
    return Response.json({ token, user: toSafeUser(user) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
