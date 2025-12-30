import { useState } from 'react';
import { Trade } from '../App';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradeCalendarProps {
  trades: Trade[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export function TradeCalendar({ trades, selectedDate, onSelectDate }: TradeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const calculateDailyPnL = (dateStr: string) => {
    const dayTrades = trades.filter(trade => trade.date === dateStr);
    
    if (dayTrades.length === 0) return null;

    // Calculate total P&L for this day (EXCLUDE withdrawals from trading P/L)
    // Use Math.abs for fees to handle any negative fee values
    const actualTrades = dayTrades.filter(trade => trade.pair !== 'WITHDRAWAL');
    const dailyPnL = actualTrades.reduce((sum, trade) => sum + trade.pnl - Math.abs(trade.fee), 0);

    return {
      pnl: dailyPnL,
      tradeCount: actualTrades.length
    };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1">
          <div className="h-full" />
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dailyData = calculateDailyPnL(dateStr);
      const date = new Date(dateStr);
      const isToday = new Date().toDateString() === date.toDateString();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Determine background color based on P&L
      let bgClass = 'bg-muted border border-border';
      if (dailyData) {
        if (dailyData.pnl > 0) {
          bgClass = 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30';
        } else if (dailyData.pnl < 0) {
          bgClass = 'bg-red-500/10 dark:bg-red-500/20 border-red-500/30';
        } else {
          bgClass = 'bg-muted border-border';
        }
      }

      if (isToday) {
        bgClass += ' ring-2 ring-primary';
      }

      days.push(
        <div key={day} className="aspect-square p-1">
          <div 
            className={`h-full rounded-lg flex flex-col relative p-1.5 ${bgClass} cursor-pointer transition-all hover:opacity-80 ${selectedDate === dateStr ? 'ring-2 ring-primary' : ''}`}
            onClick={() => onSelectDate(selectedDate === dateStr ? null : dateStr)}
          >
            {/* Date and day of week at the top */}
            <div className="flex items-start justify-between">
              <div className="text-[clamp(6px,1.5vw,12px)] text-muted-foreground leading-none">
                {dayOfWeek}
              </div>
              <div className="text-[clamp(7px,1.8vw,14px)] font-medium text-foreground leading-none">
                {day}
              </div>
            </div>

            {/* P&L in center */}
            <div className="flex-1 flex items-center justify-center">
              {dailyData && dailyData.pnl !== 0 && (
                <div className="text-center">
                  <div className={`text-[clamp(10px,2.5vw,18px)] font-semibold leading-none ${dailyData.pnl > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${Math.abs(dailyData.pnl).toFixed(0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h3>{monthName}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
}