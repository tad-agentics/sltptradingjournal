import { Trade } from '../App';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

interface PortfolioSummaryProps {
  trades: Trade[];
  currentBalance: number;
}

export function PortfolioSummary({ trades, currentBalance }: PortfolioSummaryProps) {
  // Calculate total withdrawals (all time)
  const totalWithdrawals = trades
    .filter(trade => trade.pair === 'WITHDRAWAL')
    .reduce((sum, trade) => sum + Math.abs(trade.pnl), 0);

  // Calculate portfolio metrics
  const calculateMetrics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter trades for current month (EXCLUDE withdrawals from trading metrics)
    const currentMonthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === currentMonth && 
             tradeDate.getFullYear() === currentYear &&
             trade.pair !== 'WITHDRAWAL'; // Exclude withdrawals
    });

    // Calculate monthly P&L (sum of all P&Ls minus fees)
    let monthlyPL = 0;
    let totalWinPnL = 0;
    let totalLossPnL = 0;
    let winCount = 0;
    let lossCount = 0;

    let monthlyFees = 0;

    currentMonthTrades.forEach(trade => {
      // Use Math.abs for fees to handle any negative fee values
      const fee = Math.abs(trade.fee);
      const netPnL = trade.pnl - fee;
      monthlyPL += netPnL;
      monthlyFees += fee;

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
    
    // Calculate fees as percentage of gross P&L (monthly P/L + fees)
    const grossPL = monthlyPL + monthlyFees;
    const feesPercent = grossPL !== 0 ? (monthlyFees / Math.abs(grossPL)) * 100 : 0;

    return {
      monthlyPL,
      monthlyEV,
      monthlyFees,
      feesPercent,
      winCount,
      lossCount
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-1 text-sm mb-1">
              <Wallet className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Current Balance</span>
            </div>
            <div className="text-2xl">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {totalWithdrawals > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                Withdrawn: ${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground mb-1">Monthly P/L</div>
            <div className="flex items-baseline gap-2">
              {metrics.monthlyPL >= 0 ? (
                <TrendingUp className="size-5 text-green-500" />
              ) : (
                <TrendingDown className="size-5 text-red-500" />
              )}
              <span className={`text-2xl ${metrics.monthlyPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(metrics.monthlyPL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

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
              ${Math.abs(metrics.monthlyEV).toFixed(2)} / {((metrics.monthlyEV / (currentBalance * 0.01))).toFixed(1)}R
            </div>
            <div className="text-sm text-muted-foreground">
              Fees: ${metrics.monthlyFees.toFixed(2)} ({metrics.feesPercent.toFixed(1)}%)
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