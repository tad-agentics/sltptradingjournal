import { Trade } from '../App';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { X, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface DailyTradeDetailProps {
  trades: Trade[];
  selectedDate: string;
  settings: {
    beginningBalance: number;
    dailyTargetR: number;
    slBudgetR: number;
    challenge: {
      enabled: boolean;
      targetBalance: number;
      durationDays: number;
      startDate: string | null;
      startingBalance: number;
    };
  };
  challengeProgress: {
    requiredDailyR: number;
  } | null;
  onClose: () => void;
  onDeleteTrade: (id: string) => void;
}

export function DailyTradeDetail({ trades, selectedDate, settings, challengeProgress, onClose, onDeleteTrade }: DailyTradeDetailProps) {
  const dayTrades = trades.filter(trade => trade.date === selectedDate);
  // Separate actual trades from withdrawals
  const actualTrades = dayTrades.filter(trade => trade.pair !== 'WITHDRAWAL');
  const withdrawals = dayTrades.filter(trade => trade.pair === 'WITHDRAWAL');
  
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // If no trades, show empty state
  if (dayTrades.length === 0) {
    return (
      <Card className="bg-card border border-border shadow-sm md:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3>{formattedDate}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No trades recorded for this day</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate performance metrics (ONLY for actual trades, not withdrawals)
  const totalTrades = actualTrades.length;
  // Use Math.abs for fees to handle any negative fee values
  const totalPnL = actualTrades.reduce((sum, trade) => sum + trade.pnl - Math.abs(trade.fee), 0);
  const totalFees = actualTrades.reduce((sum, trade) => sum + Math.abs(trade.fee), 0);
  
  const winningTrades = actualTrades.filter(trade => trade.pnl > 0);
  const losingTrades = actualTrades.filter(trade => trade.pnl < 0);
  const winCount = winningTrades.length;
  const lossCount = losingTrades.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

  // Calculate start-of-day balance (beginning balance + all P&L from previous days)
  const previousDaysTrades = trades.filter(trade => trade.date < selectedDate);
  const previousDaysPnL = previousDaysTrades.reduce((sum, trade) => sum + trade.pnl - Math.abs(trade.fee), 0);
  const startOfDayBalance = settings.beginningBalance + previousDaysPnL;

  // Calculate R (1% of start-of-day balance)
  const rValue = startOfDayBalance * 0.01;
  const totalR = totalPnL / rValue;
  
  // Calculate target and budget in dollars
  const dailyTargetAmount = rValue * settings.dailyTargetR;
  const slBudgetAmount = rValue * settings.slBudgetR;

  // Check if daily R target was achieved (for challenge mode)
  const requiredR = challengeProgress?.requiredDailyR || 0;
  const rAchieved = totalR >= requiredR;

  return (
    <Card className="bg-card border border-border shadow-sm md:shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3>{formattedDate}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted border border-border rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">Total Trades</div>
            <div className="text-lg">{totalTrades}</div>
          </div>
          <div className="bg-muted border border-border rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">Total P&L</div>
            <div className={`text-lg ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted border border-border rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">Win Rate</div>
            <div className="text-lg">{winRate.toFixed(0)}%</div>
            <div className="text-[9px] text-muted-foreground">{winCount}W / {lossCount}L</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted border border-border rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">Total Fees</div>
            <div>${totalFees.toFixed(2)}</div>
          </div>
          <div className="bg-muted border border-border rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">Total R</div>
            <div className={`${totalR >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalR >= 0 ? '+' : ''}{totalR.toFixed(2)}R
            </div>
            <div className="text-[9px] text-muted-foreground">1R = ${rValue.toFixed(2)}</div>
          </div>
        </div>

        {/* Daily Targets - Show Challenge data if enabled, otherwise show regular goals */}
        {settings.challenge.enabled && challengeProgress ? (
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="text-[10px] text-muted-foreground mb-2">Challenge Target</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] text-muted-foreground mb-0.5">Daily R Required</div>
                <div className="text-green-600 dark:text-green-400 text-sm">
                  {requiredR.toFixed(2)}R
                </div>
              </div>
              <div>
                <div className="text-[9px] text-muted-foreground mb-0.5">Status</div>
                <div className={`text-sm ${rAchieved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {rAchieved ? '✓ Achieved' : '✗ Not Achieved'}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  Actual: {totalR.toFixed(2)}R
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="text-[10px] text-muted-foreground mb-2">Daily Goals</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] text-muted-foreground mb-0.5">Target</div>
                <div className="text-green-600 dark:text-green-400 text-sm">
                  +{settings.dailyTargetR}R (${dailyTargetAmount.toFixed(2)})
                </div>
              </div>
              <div>
                <div className="text-[9px] text-muted-foreground mb-0.5">SL Budget</div>
                <div className="text-red-600 dark:text-red-400 text-sm">
                  -{settings.slBudgetR}R (${slBudgetAmount.toFixed(2)})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade List - 1 line each */}
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground mb-2">Trades</div>
          {dayTrades.map((trade) => (
            <div 
              key={trade.id} 
              className="bg-muted border border-border rounded-lg p-2 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm">{trade.pair}</span>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 h-4 ${
                    trade.direction === 'long' 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                  }`}
                >
                  {trade.direction === 'long' ? (
                    <><TrendingUp className="size-2.5 mr-0.5" /> L</>
                  ) : (
                    <><TrendingDown className="size-2.5 mr-0.5" /> S</>
                  )}
                </Badge>
                {trade.notes && (
                  <span className="text-[10px] text-muted-foreground truncate">{trade.notes}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">Fee: ${Math.abs(trade.fee).toFixed(2)}</span>
                <span className={`text-sm ${trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteTrade(trade.id)}
                  className="size-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}