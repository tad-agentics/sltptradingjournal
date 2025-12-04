import { Trade } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Award, AlertTriangle, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from './ui/button';

interface StatsPageProps {
  trades: Trade[];
  onBack: () => void;
}

export function StatsPage({ trades, onBack }: StatsPageProps) {
  // Calculate all statistics
  const calculateStats = () => {
    if (trades.length === 0) {
      return {
        netPnL: 0,
        winRate: 0,
        profitFactor: 0,
        avgRiskReward: 0,
        largestWin: 0,
        largestLoss: 0,
        tradeBias: { long: 0, short: 0, bias: 'Neutral' },
        mostTradedPair: 'N/A',
        mostProfitablePair: 'N/A',
        largestLossPair: 'N/A',
        cumulativeData: [],
        individualTradeData: [],
        performanceBySymbol: []
      };
    }

    // Net P&L
    const netPnL = trades.reduce((sum, trade) => sum + (trade.pnl - trade.fee), 0);

    // Win Rate
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

    // Profit Factor (Total Wins / Total Losses)
    const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    // Average Risk:Reward (Average Win / Average Loss)
    const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;
    const avgRiskReward = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    // Largest Win & Loss
    const largestWin = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
    const largestLoss = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;

    // Trade Bias
    const longCount = trades.filter(t => t.direction === 'long').length;
    const shortCount = trades.filter(t => t.direction === 'short').length;
    let bias = 'Neutral';
    if (longCount > shortCount) bias = 'Long';
    else if (shortCount > longCount) bias = 'Short';

    // Pair Statistics
    const pairStats: { [key: string]: { count: number; pnl: number; minLoss: number } } = {};
    trades.forEach(trade => {
      if (!pairStats[trade.pair]) {
        pairStats[trade.pair] = { count: 0, pnl: 0, minLoss: 0 };
      }
      pairStats[trade.pair].count++;
      pairStats[trade.pair].pnl += (trade.pnl - trade.fee);
      pairStats[trade.pair].minLoss = Math.min(pairStats[trade.pair].minLoss, trade.pnl);
    });

    const mostTradedPair = Object.entries(pairStats).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'N/A';
    const mostProfitablePair = Object.entries(pairStats).sort((a, b) => b[1].pnl - a[1].pnl)[0]?.[0] || 'N/A';
    const largestLossPair = Object.entries(pairStats).sort((a, b) => a[1].minLoss - b[1].minLoss)[0]?.[0] || 'N/A';

    // Cumulative P&L Data (sorted by date)
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const cumulativeData = sortedTrades.map((trade, index) => {
      cumulative += (trade.pnl - trade.fee);
      return {
        index: index + 1,
        date: new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumulative: Number(cumulative.toFixed(2))
      };
    });

    // Individual Trade P&L Data
    const individualTradeData = sortedTrades.map((trade, index) => ({
      index: index + 1,
      pnl: Number((trade.pnl - trade.fee).toFixed(2)),
      pair: trade.pair,
      date: new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // Performance by Symbol
    const symbolPerformance: { [key: string]: { wins: number; losses: number; winPnL: number; lossPnL: number } } = {};
    trades.forEach(trade => {
      if (!symbolPerformance[trade.pair]) {
        symbolPerformance[trade.pair] = { wins: 0, losses: 0, winPnL: 0, lossPnL: 0 };
      }
      if (trade.pnl > 0) {
        symbolPerformance[trade.pair].wins++;
        symbolPerformance[trade.pair].winPnL += trade.pnl;
      } else if (trade.pnl < 0) {
        symbolPerformance[trade.pair].losses++;
        symbolPerformance[trade.pair].lossPnL += Math.abs(trade.pnl);
      }
    });

    const performanceBySymbol = Object.entries(symbolPerformance).map(([pair, stats]) => ({
      pair,
      wins: stats.wins,
      losses: stats.losses,
      winPnL: Number(stats.winPnL.toFixed(2)),
      lossPnL: Number(stats.lossPnL.toFixed(2))
    }));

    return {
      netPnL,
      winRate,
      profitFactor,
      avgRiskReward,
      largestWin,
      largestLoss,
      tradeBias: { long: longCount, short: shortCount, bias },
      mostTradedPair,
      mostProfitablePair,
      largestLossPair,
      cumulativeData,
      individualTradeData,
      performanceBySymbol
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background pb-8 md:pb-20">
      {/* Header */}
      <div className="bg-background sticky top-0 z-10 border-b border-border">
        <div className="px-3 py-3 md:px-4 md:py-4 flex items-center gap-2 md:gap-3">
          <Button 
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full size-8 md:size-10"
          >
            <ArrowLeft className="size-4 md:size-5" />
          </Button>
          <h1 className="text-base md:text-lg font-semibold">Trading Statistics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-3 md:px-4 md:py-4 space-y-4 md:space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {/* Net P&L */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Net P&L</div>
              <div className={`text-base md:text-xl ${stats.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(stats.netPnL).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Win Rate</div>
              <div className="text-base md:text-xl">{stats.winRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          {/* Profit Factor */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Profit Factor</div>
              <div className="text-base md:text-xl">
                {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Avg Risk:Reward */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Avg Risk:Reward</div>
              <div className="text-base md:text-xl">
                {stats.avgRiskReward === Infinity ? '∞' : `1:${stats.avgRiskReward.toFixed(2)}`}
              </div>
            </CardContent>
          </Card>

          {/* Largest Win */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                <Award className="size-3" />
                <span>Largest Win</span>
              </div>
              <div className="text-base md:text-xl text-green-500">${stats.largestWin.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* Largest Loss */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                <AlertTriangle className="size-3" />
                <span>Largest Loss</span>
              </div>
              <div className="text-base md:text-xl text-red-500">${Math.abs(stats.largestLoss).toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* Trade Bias */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Trade Bias</div>
              <div className="text-base md:text-xl">{stats.tradeBias.bias}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">
                {stats.tradeBias.long}L / {stats.tradeBias.short}S
              </div>
            </CardContent>
          </Card>

          {/* Most Traded Pair */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Most Traded</div>
              <div className="text-base md:text-xl truncate">{stats.mostTradedPair}</div>
            </CardContent>
          </Card>

          {/* Most Profitable Pair */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                <TrendingUp className="size-3" />
                <span>Most Profitable</span>
              </div>
              <div className="text-base md:text-xl text-green-500 truncate">{stats.mostProfitablePair}</div>
            </CardContent>
          </Card>

          {/* Largest Loss Pair */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-3 pb-3 px-3 md:pt-4 md:pb-4 md:px-6">
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                <TrendingDown className="size-3" />
                <span>Largest Loss Pair</span>
              </div>
              <div className="text-base md:text-xl text-red-500 truncate">{stats.largestLossPair}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-4 md:space-y-6">
          {/* Cumulative P&L Chart */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-xs md:text-sm">Cumulative P&L</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.cumulativeData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    style={{ fontSize: '10px' }}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#888" style={{ fontSize: '10px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Individual Trade P&L Chart */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-xs md:text-sm">Individual Trade P&L</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.individualTradeData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="index" 
                    stroke="#888" 
                    style={{ fontSize: '10px' }}
                    label={{ value: 'Trade #', position: 'insideBottom', offset: -2, fill: '#888', fontSize: '10px' }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: '10px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `$${value.toFixed(2)}`,
                      `${props.payload.pair} - ${props.payload.date}`
                    ]}
                  />
                  <Bar 
                    dataKey="pnl" 
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  >
                    {stats.individualTradeData.map((entry, index) => (
                      <Bar key={`bar-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance by Symbol Chart */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-xs md:text-sm">Performance by Symbol</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.performanceBySymbol} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="pair" 
                    stroke="#888" 
                    style={{ fontSize: '10px' }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: '10px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="wins" 
                    fill="#22c55e" 
                    name="Wins"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="losses" 
                    fill="#ef4444" 
                    name="Losses"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

