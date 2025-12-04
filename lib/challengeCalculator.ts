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
 * Calculate required daily R and assess risk level based on account size
 * Risk level is informational only - it tells you how aggressive your target is
 * The required daily R is always the true mathematical requirement to reach your goal
 */
function calculateDynamicDailyR(
  currentBalance: number,
  targetBalance: number,
  daysRemaining: number
): { dailyR: number; riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' } {
  if (daysRemaining <= 0) return { dailyR: 0, riskLevel: 'Conservative' };
  
  // Calculate compound daily growth rate needed (this is the TRUE requirement)
  const totalGrowthNeeded = targetBalance / currentBalance;
  const dailyGrowthMultiplier = Math.pow(totalGrowthNeeded, 1 / daysRemaining);
  const dailyGrowthPercent = (dailyGrowthMultiplier - 1) * 100;
  
  // Risk level assessment based on account size and required R
  // This is informational only - warns you how aggressive your goal is
  // Larger accounts should typically target lower R for risk management
  let riskLevel: 'Conservative' | 'Moderate' | 'Aggressive' = 'Conservative';
  
  if (currentBalance < 5000) {
    // Small account thresholds
    riskLevel = dailyGrowthPercent > 2 ? 'Aggressive' : dailyGrowthPercent > 1 ? 'Moderate' : 'Conservative';
  } else if (currentBalance < 10000) {
    // Medium account: lower thresholds
    riskLevel = dailyGrowthPercent > 1.5 ? 'Aggressive' : dailyGrowthPercent > 0.75 ? 'Moderate' : 'Conservative';
  } else if (currentBalance < 25000) {
    // Large account: even lower thresholds
    riskLevel = dailyGrowthPercent > 1 ? 'Aggressive' : dailyGrowthPercent > 0.5 ? 'Moderate' : 'Conservative';
  } else if (currentBalance < 50000) {
    // Very large account
    riskLevel = dailyGrowthPercent > 0.75 ? 'Aggressive' : dailyGrowthPercent > 0.4 ? 'Moderate' : 'Conservative';
  } else {
    // Huge account: most conservative thresholds
    riskLevel = dailyGrowthPercent > 0.5 ? 'Aggressive' : dailyGrowthPercent > 0.25 ? 'Moderate' : 'Conservative';
  }
  
  // Return the TRUE required daily R (not reduced) with risk assessment
  return { dailyR: dailyGrowthPercent, riskLevel };
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

