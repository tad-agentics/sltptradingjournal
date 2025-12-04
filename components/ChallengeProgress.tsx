import { Card, CardContent } from './ui/card';
import { Target } from 'lucide-react';

interface ChallengeProgressProps {
  currentBalance: number;
  targetBalance: number;
  requiredDailyR: number;
  daysRemaining: number;
  riskLevel: string;
}

export function ChallengeProgress({ 
  currentBalance, 
  targetBalance, 
  requiredDailyR, 
  daysRemaining,
  riskLevel 
}: ChallengeProgressProps) {
  const progressPercent = (currentBalance / targetBalance) * 100;

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Target className="size-4" />
          <span>Challenge Progress</span>
        </div>
        
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-foreground">${currentBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          <span className="text-foreground">${targetBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
        
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Required Daily R</div>
            <div className="text-xs text-green-500">{requiredDailyR.toFixed(2)}R</div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-1">Days Remaining</div>
            <div className="text-xs">{daysRemaining} days</div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
            <div className="text-xs text-green-500">{riskLevel}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

