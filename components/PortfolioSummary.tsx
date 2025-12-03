import { Trade } from '../App';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PortfolioSummaryProps {
  trades: Trade[];
}

export function PortfolioSummary({ trades }: PortfolioSummaryProps) {
  // Calculate portfolio metrics
  const calculateMetrics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter trades for current month
    const currentMonthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
    });

    // Calculate monthly P&L (sum of all P&Ls minus fees)
    let monthlyPL = 0;
    let totalWinPnL = 0;
    let totalLossPnL = 0;
    let winCount = 0;
    let lossCount = 0;

    currentMonthTrades.forEach(trade => {
      const netPnL = trade.pnl - trade.fee;
      monthlyPL += netPnL;

      if (trade.pnl > 0) {
        totalWinPnL += trade.pnl;
        winCount++;
      } else if (trade.pnl < 0) {
        totalLossPnL += Math.abs(trade.pnl);
        lossCount++;
      }
    });

    // Calculate Monthly EV: (total win P&L - total loss P&L) / number of winning trades
    const monthlyEV = winCount > 0 ? (totalWinPnL - totalLossPnL) / winCount : 0;

    return {
      monthlyPL,
      monthlyEV,
      winCount,
      lossCount
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-3">
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground mb-1">Current Monthly P/L</div>
          <div className="flex items-baseline gap-2">
            {metrics.monthlyPL >= 0 ? (
              <TrendingUp className="size-6 text-green-500" />
            ) : (
              <TrendingDown className="size-6 text-red-500" />
            )}
            <span className={`text-3xl ${metrics.monthlyPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(metrics.monthlyPL).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-1 text-sm mb-1">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Monthly EV
              </span>
            </div>
            <div className={metrics.monthlyEV >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${Math.abs(metrics.monthlyEV).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.winCount}W / {metrics.lossCount}L
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl">
              {metrics.winCount + metrics.lossCount > 0 
                ? ((metrics.winCount / (metrics.winCount + metrics.lossCount)) * 100).toFixed(0)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.winCount}W / {metrics.lossCount}L
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}