import { Trade } from '../App';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from './ui/badge';

interface DailyTradeDetailProps {
  trades: Trade[];
  selectedDate: string;
  settings: {
    beginningBalance: number;
    dailyTargetR: number;
    slBudgetR: number;
  };
  onClose: () => void;
}

export function DailyTradeDetail({ trades, selectedDate, settings, onClose }: DailyTradeDetailProps) {
  const dayTrades = trades.filter(trade => trade.date === selectedDate);
  
  if (dayTrades.length === 0) return null;

  // Calculate performance metrics
  const totalTrades = dayTrades.length;
  const totalPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl - trade.fee, 0);
  const totalFees = dayTrades.reduce((sum, trade) => sum + trade.fee, 0);
  
  const winningTrades = dayTrades.filter(trade => trade.pnl > 0);
  const losingTrades = dayTrades.filter(trade => trade.pnl < 0);
  const winCount = winningTrades.length;
  const lossCount = losingTrades.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

  // Calculate R (1% of account balance)
  const rValue = settings.beginningBalance * 0.01;
  const totalR = totalPnL / rValue;
  
  // Calculate target and budget in dollars
  const dailyTargetAmount = rValue * settings.dailyTargetR;
  const slBudgetAmount = rValue * settings.slBudgetR;

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="bg-card border border-border shadow-sm">
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

        {/* Daily Targets */}
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
                <span className="text-[10px] text-muted-foreground">Fee: ${trade.fee.toFixed(2)}</span>
                <span className={`text-sm ${trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}