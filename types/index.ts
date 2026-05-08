export type Role = "user" | "admin";
export type ContributionType = "task" | "learning" | "collaboration" | "community" | "research";
export type ContributionStatus = "pending" | "approved" | "rejected";
export type RedemptionStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  ecBalance: number;
  totalEcEarned: number;
  totalEcRedeemed: number;
  reputationScore: number;
  integrityMultiplier: number;
  integrityPenaltyUntil: string | null;
  auditViolations: number;
  avatarColor: string;
  bio: string;
  createdAt: string;
}

export interface Contribution {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: ContributionType;
  hoursClaimed: number;
  qualityFactor: number | null;
  collaborationBonus: number;
  ecAwarded: number;
  status: ContributionStatus;
  adminNotes: string;
  evidenceUrl: string;
  isFlaggedForAudit: boolean;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  ecCost: number;
  stock: number;
  category: string;
  icon: string;
  isActive: boolean;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  ecSpent: number;
  status: RedemptionStatus;
  redeemedAt: string;
}

export interface DB {
  users: User[];
  contributions: Contribution[];
  rewards: Reward[];
  redemptions: Redemption[];
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  ecBalance: number;
  totalEcEarned: number;
  totalEcRedeemed: number;
  reputationScore: number;
  integrityMultiplier: number;
  integrityPenaltyUntil: string | null;
  auditViolations: number;
  avatarColor: string;
  bio: string;
  createdAt: string;
}
