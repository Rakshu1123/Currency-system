import { NextRequest } from "next/server";
import { ensureDB, writeDB, makeId, makeColor, toSafeUser } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return Response.json({ error: "All fields required" }, { status: 400 });
    if (password.length < 6) return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const db = await ensureDB();
    if (db.users.find(u => u.email === email)) {
      return Response.json({ error: "Email already registered" }, { status: 400 });
    }

    const user = {
      id: makeId(), name, email,
      passwordHash: await hashPassword(password),
      role: "user" as const,
      ecBalance: 0, totalEcEarned: 0, totalEcRedeemed: 0,
      reputationScore: 1.0, integrityMultiplier: 1.0,
      integrityPenaltyUntil: null, auditViolations: 0,
      avatarColor: makeColor(), bio: "", createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDB(db);

    const token = signToken({ sub: user.id, role: user.role, name: user.name });
    return Response.json({ token, user: toSafeUser(user) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
