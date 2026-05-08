import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { DB, User, Reward } from "@/types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const AVATAR_COLORS = ["#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#10b981","#3b82f6","#ef4444","#f97316"];

function randomId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

const DEFAULT_REWARDS: Reward[] = [
  { id: "r1", name: "Digital Badge", description: "Verified contributor badge on your profile", tier: 1, ecCost: 5, stock: -1, category: "recognition", icon: "🏅", isActive: true },
  { id: "r2", name: "Resume Certification", description: "Official CHIAC certificate for your resume", tier: 1, ecCost: 15, stock: -1, category: "recognition", icon: "📜", isActive: true },
  { id: "r3", name: "Premium Content Access", description: "Access to exclusive learning modules for 30 days", tier: 1, ecCost: 20, stock: -1, category: "learning", icon: "📚", isActive: true },
  { id: "r4", name: "Priority Project Selection", description: "Get first pick on new projects next sprint", tier: 2, ecCost: 40, stock: 10, category: "career", icon: "🎯", isActive: true },
  { id: "r5", name: "Career Mentorship Session", description: "1-hour 1:1 mentorship with a senior professional", tier: 2, ecCost: 60, stock: 5, category: "career", icon: "🧑‍💼", isActive: true },
  { id: "r6", name: "Recommendation Letter", description: "Official recommendation letter from CHIAC leadership", tier: 2, ecCost: 80, stock: 3, category: "career", icon: "✉️", isActive: true },
  { id: "r7", name: "Stipend Bonus", description: "Cash stipend bonus added to your compensation", tier: 3, ecCost: 150, stock: 5, category: "monetary", icon: "💰", isActive: true },
  { id: "r8", name: "Fast-Track Hiring", description: "Skip to final round in CHIAC hiring process", tier: 3, ecCost: 200, stock: 2, category: "career", icon: "🚀", isActive: true },
  { id: "r9", name: "Leadership Role", description: "Team lead position on next major project", tier: 3, ecCost: 250, stock: 2, category: "career", icon: "👑", isActive: true },
  { id: "r10", name: "Equity Participation", description: "Equity stake in a CHIAC spinoff project", tier: 3, ecCost: 500, stock: 1, category: "monetary", icon: "📈", isActive: true },
];

async function buildDefaultDB(): Promise<DB> {
  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("demo123", 10);
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "admin-1", name: "Admin", email: "admin@ec.platform", passwordHash: adminHash, role: "admin",
        ecBalance: 9999, totalEcEarned: 9999, totalEcRedeemed: 0, reputationScore: 5.0,
        integrityMultiplier: 1.0, integrityPenaltyUntil: null, auditViolations: 0,
        avatarColor: "#f59e0b", bio: "Platform administrator", createdAt: now,
      },
      {
        id: "demo-1", name: "Likith Kumar", email: "demo@ec.platform", passwordHash: demoHash, role: "user",
        ecBalance: 120.5, totalEcEarned: 245.0, totalEcRedeemed: 124.5, reputationScore: 3.8,
        integrityMultiplier: 1.0, integrityPenaltyUntil: null, auditViolations: 0,
        avatarColor: "#6366f1", bio: "Engineering grad | UPSC aspirant | ASI contributor", createdAt: now,
      },
    ],
    contributions: [],
    rewards: DEFAULT_REWARDS,
    redemptions: [],
  };
}

export function readDB(): DB {
  try {
    if (!fs.existsSync(DB_PATH)) return { users: [], contributions: [], rewards: DEFAULT_REWARDS, redemptions: [] };
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as DB;
  } catch {
    return { users: [], contributions: [], rewards: DEFAULT_REWARDS, redemptions: [] };
  }
}

export function writeDB(db: DB): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function ensureDB(): Promise<DB> {
  if (!fs.existsSync(DB_PATH)) {
    const db = await buildDefaultDB();
    writeDB(db);
    return db;
  }
  return readDB();
}

export function makeId(): string { return randomId(); }
export function makeColor(): string { return randomColor(); }

export function toSafeUser(u: User) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = u;
  return safe;
}
