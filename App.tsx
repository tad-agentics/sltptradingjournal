import { useState, useEffect } from 'react';
import { AddTradeDialog } from './components/AddTradeDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { PortfolioSummary } from './components/PortfolioSummary';
import { TradeCalendar } from './components/TradeCalendar';
import { DailyTradeDetail } from './components/DailyTradeDetail';
import { Button } from './components/ui/button';
import { Plus, Settings } from 'lucide-react';

export interface Trade {
  id: string;
  pair: string;
  direction: 'long' | 'short';
  pnl: number;
  fee: number;
  date: string;
  notes?: string;
}

export default function App() {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const savedTrades = localStorage.getItem('sltp-trades');
    if (savedTrades) {
      return JSON.parse(savedTrades);
    }
    return [
      {
        id: '1',
        pair: 'BTC/USD',
        direction: 'long',
        pnl: 150.00,
        fee: 2.50,
        date: '2025-12-02',
        notes: 'Strong momentum'
      },
      {
        id: '2',
        pair: 'ETH/USD',
        direction: 'long',
        pnl: 85.00,
        fee: 1.50,
        date: '2025-12-05',
      },
      {
        id: '3',
        pair: 'BTC/USD',
        direction: 'short',
        pnl: -45.00,
        fee: 2.50,
        date: '2025-12-10',
        notes: 'Stop loss triggered'
      },
      {
        id: '4',
        pair: 'SOL/USD',
        direction: 'long',
        pnl: 120.00,
        fee: 1.80,
        date: '2025-12-15',
      },
      {
        id: '5',
        pair: 'ETH/USD',
        direction: 'short',
        pnl: 60.00,
        fee: 1.50,
        date: '2025-12-18',
        notes: 'Profit taking'
      },
      {
        id: '6',
        pair: 'BNB/USD',
        direction: 'long',
        pnl: 95.00,
        fee: 1.75,
        date: '2025-12-20',
      },
      {
        id: '7',
        pair: 'SOL/USD',
        direction: 'short',
        pnl: -30.00,
        fee: 1.80,
        date: '2025-12-22',
        notes: 'Cut losses'
      },
      {
        id: '8',
        pair: 'BTC/USD',
        direction: 'long',
        pnl: 200.00,
        fee: 2.50,
        date: '2025-12-28',
        notes: 'Year end rally'
      }
    ];
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('sltp-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      beginningBalance: 10000,
      dailyTargetR: 2.0,
      slBudgetR: 1.0,
      theme: 'dark' as 'light' | 'dark',
      pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD']
    };
  });

  // Save trades to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sltp-trades', JSON.stringify(trades));
  }, [trades]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sltp-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const addTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade = {
      ...trade,
      id: Date.now().toString()
    };
    setTrades([newTrade, ...trades]);
  };

  const deleteTrade = (id: string) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-transparent sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1>SLTP Trading Journal</h1>
          <Button 
            onClick={() => setIsSettingsDialogOpen(true)}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <PortfolioSummary trades={trades} />
        <TradeCalendar trades={trades} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        {selectedDate && (
          <DailyTradeDetail 
            trades={trades} 
            selectedDate={selectedDate} 
            settings={settings}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="relative">
          {/* Floating Add Trade Button */}
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black rounded-full px-5 py-2 shadow-xl flex items-center gap-2 hover:bg-white/90 transition-all hover:scale-105"
          >
            <Plus className="size-4" />
            <span className="font-medium">Trade</span>
          </button>
        </div>
      </div>

      <AddTradeDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTrade={addTrade}
        pairs={settings.pairs}
      />
      <SettingsDialog 
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}