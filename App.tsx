import { useState, useEffect } from 'react';
import { AddTradeDialog } from './components/AddTradeDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { PortfolioSummary } from './components/PortfolioSummary';
import { TradeCalendar } from './components/TradeCalendar';
import { DailyTradeDetail } from './components/DailyTradeDetail';
import { Button } from './components/ui/button';
import { Plus, Settings, Cloud, CloudOff, LogIn } from 'lucide-react';
import { tradeService, isUsingSupabase } from './lib/tradeService';
import { AuthProvider, useAuth } from './lib/auth';

export interface Trade {
  id: string;
  pair: string;
  direction: 'long' | 'short';
  pnl: number;
  fee: number;
  date: string;
  notes?: string;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load trades when user changes or on mount
  useEffect(() => {
    const loadTrades = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      // If using Supabase but not authenticated, don't load trades
      if (isUsingSupabase() && !user) {
        setIsLoading(false);
        setTrades([]);
        return;
      }

      try {
        setIsLoading(true);
        const loadedTrades = await tradeService.getAllTrades();
        setTrades(loadedTrades);
        
        // If using Supabase and user just logged in, sync any local trades
        if (isUsingSupabase() && user) {
          const localTrades = localStorage.getItem('sltp-trades');
          if (localTrades) {
            const parsedLocalTrades = JSON.parse(localTrades);
            if (parsedLocalTrades.length > 0) {
              await tradeService.syncWithLocalStorage(parsedLocalTrades);
              // Reload after sync
              const syncedTrades = await tradeService.getAllTrades();
              setTrades(syncedTrades);
              // Clear local storage after successful sync
              localStorage.removeItem('sltp-trades');
            }
          }
        }
      } catch (error) {
        console.error('Error loading trades:', error);
        // Fallback to localStorage on error
        const savedTrades = localStorage.getItem('sltp-trades');
        if (savedTrades) {
          setTrades(JSON.parse(savedTrades));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
  }, [user, authLoading]);

  // Save trades to localStorage as backup (only if not using Supabase)
  useEffect(() => {
    if (!isUsingSupabase() && trades.length > 0) {
      localStorage.setItem('sltp-trades', JSON.stringify(trades));
    }
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

  const addTrade = async (trade: Omit<Trade, 'id'>) => {
    try {
      const newTrade = await tradeService.addTrade(trade);
      setTrades([newTrade, ...trades]);
    } catch (error) {
      console.error('Error adding trade:', error);
      // Fallback to local state
      const newTrade = {
        ...trade,
        id: Date.now().toString()
      };
      setTrades([newTrade, ...trades]);
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      await tradeService.deleteTrade(id);
      setTrades(trades.filter(trade => trade.id !== id));
    } catch (error) {
      console.error('Error deleting trade:', error);
      // Still update UI on error
      setTrades(trades.filter(trade => trade.id !== id));
    }
  };

  // Show loading screen while auth or trades are loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading your trades...'}
          </p>
        </div>
      </div>
    );
  }

  // If using Supabase and not authenticated, show login prompt
  if (isUsingSupabase() && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <LogIn className="size-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">SLTP Trading Journal</h1>
            <p className="text-muted-foreground">
              Sign in to access your trading journal and sync your trades across devices.
            </p>
          </div>
          <Button 
            onClick={() => setIsSettingsDialogOpen(true)}
            size="lg"
            className="w-full"
          >
            Sign In / Sign Up
          </Button>
          <SettingsDialog 
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
            settings={settings}
            onSaveSettings={setSettings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-transparent sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1>SLTP Trading Journal</h1>
            {isUsingSupabase() ? (
              <Cloud className="size-4 text-green-500" />
            ) : (
              <CloudOff className="size-4 text-yellow-500" />
            )}
          </div>
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
            onDeleteTrade={deleteTrade}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}