import type { User, Contribution } from "@/types";

export const WEEKLY_CAP = 40;
export const LEARNING_CAP = WEEKLY_CAP * 0.25; // 10 EC max from learning

export const QUALITY_FACTORS: Record<string, number> = {
  poor: 0.5,
  satisfactory: 1.0,
  strong: 1.2,
  exceptional: 1.5,
};

export function calculateEC(
  hours: number,
  qualityFactor: number,
  collaborationBonus: number,
  integrityMultiplier: number,
  type: string
): number {
  let ec = (hours * qualityFactor + collaborationBonus) * integrityMultiplier;
  if (type === "learning") ec = Math.min(ec, LEARNING_CAP);
  return Math.round(ec * 100) / 100;
}

export function getWeeklyEarned(contributions: Contribution[], userId: string): number {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return contributions
    .filter(c => c.userId === userId && c.status === "approved" && c.reviewedAt && c.reviewedAt >= weekAgo)
    .reduce((sum, c) => sum + c.ecAwarded, 0);
}

export function getReputationScore(user: User): number {
  const base = Math.min(user.totalEcEarned / 100, 4.0);
  const penalty = user.auditViolations * 0.5;
  return Math.round(Math.max(0, Math.min(5, base - penalty + 1)) * 10) / 10;
}

export function applyAuditPenalty(user: User): User {
  const until = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  return { ...user, integrityMultiplier: 0.5, integrityPenaltyUntil: until, auditViolations: user.auditViolations + 1 };
}

export function checkAndRestoreIntegrity(user: User): User {
  if (user.integrityPenaltyUntil && new Date() > new Date(user.integrityPenaltyUntil)) {
    return { ...user, integrityMultiplier: 1.0, integrityPenaltyUntil: null };
  }
  return user;
}
