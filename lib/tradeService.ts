import { supabase, isSupabaseConfigured } from './supabase';
import { Trade } from '../App';

// Database table schema:
// CREATE TABLE trades (
//   id TEXT PRIMARY KEY,
//   pair TEXT NOT NULL,
//   direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
//   pnl DECIMAL NOT NULL,
//   fee DECIMAL NOT NULL,
//   date TEXT NOT NULL,
//   notes TEXT,
//   user_id TEXT NOT NULL,
//   created_at TIMESTAMP DEFAULT NOW()
// );

export interface TradeService {
  getAllTrades: () => Promise<Trade[]>;
  addTrade: (trade: Omit<Trade, 'id'>) => Promise<Trade>;
  deleteTrade: (id: string) => Promise<void>;
  syncWithLocalStorage: (localTrades: Trade[]) => Promise<void>;
}

// Supabase implementation
const supabaseService: TradeService = {
  getAllTrades: async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  addTrade: async (trade: Omit<Trade, 'id'>) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newTrade = {
      ...trade,
      id: Date.now().toString(),
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('trades')
      .insert([newTrade])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteTrade: async (id: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  syncWithLocalStorage: async (localTrades: Trade[]) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get all trades from Supabase for this user
    const remoteTrades = await supabaseService.getAllTrades();
    const remoteIds = new Set(remoteTrades.map(t => t.id));
    
    // Upload local trades that don't exist in Supabase
    const tradesToUpload = localTrades.filter(t => !remoteIds.has(t.id)).map(t => ({
      ...t,
      user_id: user.id,
    }));
    
    if (tradesToUpload.length > 0) {
      const { error } = await supabase
        .from('trades')
        .insert(tradesToUpload);
      
      if (error) throw error;
    }
  }
};

// LocalStorage implementation (fallback)
const localStorageService: TradeService = {
  getAllTrades: async () => {
    const savedTrades = localStorage.getItem('sltp-trades');
    return savedTrades ? JSON.parse(savedTrades) : [];
  },

  addTrade: async (trade: Omit<Trade, 'id'>) => {
    const trades = await localStorageService.getAllTrades();
    const newTrade = {
      ...trade,
      id: Date.now().toString(),
    };
    const updatedTrades = [newTrade, ...trades];
    localStorage.setItem('sltp-trades', JSON.stringify(updatedTrades));
    return newTrade;
  },

  deleteTrade: async (id: string) => {
    const trades = await localStorageService.getAllTrades();
    const updatedTrades = trades.filter(t => t.id !== id);
    localStorage.setItem('sltp-trades', JSON.stringify(updatedTrades));
  },

  syncWithLocalStorage: async () => {
    // No-op for localStorage service
  }
};

// Export the appropriate service based on configuration
export const tradeService: TradeService = isSupabaseConfigured() 
  ? supabaseService 
  : localStorageService;

// Helper to check which service is active
export const isUsingSupabase = () => isSupabaseConfigured();
