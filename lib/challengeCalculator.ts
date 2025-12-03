export interface ChallengeSettings {
  enabled: boolean;
  targetBalance: number;
  durationDays: number;
  startDate: string | null;
  startingBalance: number;
}

export interface ChallengeProgress {
  currentBalance: number;
  daysElapsed: number;
  daysRemaining: number;
  requiredDailyR: number;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
}

/**
 * Calculate dynamic daily R based on account size and progress
 * Risk management: smaller accounts can handle higher R, larger accounts reduce R
 */
function calculateDynamicDailyR(
  currentBalance: number,
  targetBalance: number,
  daysRemaining: number
): { dailyR: number; riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' } {
  if (daysRemaining <= 0) return { dailyR: 0, riskLevel: 'Conservative' };
  
  // Calculate compound daily growth rate needed
  const totalGrowthNeeded = targetBalance / currentBalance;
  const dailyGrowthMultiplier = Math.pow(totalGrowthNeeded, 1 / daysRemaining);
  const dailyGrowthPercent = (dailyGrowthMultiplier - 1) * 100;
  
  // Risk scaling based on account size
  // Smaller accounts: higher R acceptable (3-4R)
  // Larger accounts: reduce R by 0.5-1R increments
  let scaledR = dailyGrowthPercent;
  let riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' = 'Conservative';
  
  if (currentBalance < 5000) {
    // Small account: can handle higher R
    scaledR = dailyGrowthPercent;
    riskLevel = dailyGrowthPercent > 2 ? 'Aggressive' : dailyGrowthPercent > 1 ? 'Moderate' : 'Conservative';
  } else if (currentBalance < 10000) {
    // Medium account: slight reduction
    scaledR = dailyGrowthPercent * 0.9;
    riskLevel = scaledR > 1.5 ? 'Moderate' : 'Conservative';
  } else if (currentBalance < 25000) {
    // Large account: reduce by 0.5R
    scaledR = dailyGrowthPercent * 0.75;
    riskLevel = 'Conservative';
  } else if (currentBalance < 50000) {
    // Very large: reduce by 1R
    scaledR = dailyGrowthPercent * 0.6;
    riskLevel = 'Conservative';
  } else {
    // Huge account: maximum risk reduction
    scaledR = dailyGrowthPercent * 0.5;
    riskLevel = 'Conservative';
  }
  
  return { dailyR: scaledR, riskLevel };
}

/**
 * Calculate challenge progress
 */
export function calculateChallengeProgress(
  challenge: ChallengeSettings,
  currentBalance: number
): ChallengeProgress | null {
  if (!challenge.enabled || !challenge.startDate) {
    return null;
  }

  const startDate = new Date(challenge.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, challenge.durationDays - daysElapsed);

  const { dailyR, riskLevel } = calculateDynamicDailyR(
    currentBalance,
    challenge.targetBalance,
    daysRemaining
  );

  return {
    currentBalance,
    daysElapsed,
    daysRemaining,
    requiredDailyR: dailyR,
    riskLevel
  };
}

