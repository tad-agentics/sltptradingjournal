import { supabase, isSupabaseConfigured } from './supabase';

// Settings interface matching App.tsx
export interface AppSettings {
  beginningBalance: number;
  dailyTargetR: number;
  slBudgetR: number;
  theme: 'light' | 'dark';
  pairs: string[];
  challenge: {
    enabled: boolean;
    targetBalance: number;
    durationDays: number;
    startDate: string | null;
    startingBalance: number;
  };
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  beginningBalance: 10000,
  dailyTargetR: 2.0,
  slBudgetR: 1.0,
  theme: 'dark',
  pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD'],
  challenge: {
    enabled: false,
    targetBalance: 0,
    durationDays: 0,
    startDate: null,
    startingBalance: 0
  }
};

export interface SettingsService {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  syncFromLocalStorage: () => Promise<AppSettings>;
}

// Supabase implementation
const supabaseService: SettingsService = {
  getSettings: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      // If no settings found, return defaults (will be created on first save)
      if (error.code === 'PGRST116') {
        return DEFAULT_SETTINGS;
      }
      throw error;
    }

    // Map database fields to app settings format
    return {
      beginningBalance: Number(data.beginning_balance),
      dailyTargetR: Number(data.daily_target_r),
      slBudgetR: Number(data.sl_budget_r),
      theme: data.theme as 'light' | 'dark',
      pairs: data.pairs as string[],
      challenge: data.challenge as AppSettings['challenge']
    };
  },

  saveSettings: async (settings: AppSettings) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Use upsert to insert or update
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        beginning_balance: settings.beginningBalance,
        daily_target_r: settings.dailyTargetR,
        sl_budget_r: settings.slBudgetR,
        theme: settings.theme,
        pairs: settings.pairs,
        challenge: settings.challenge
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  },

  syncFromLocalStorage: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user already has settings in Supabase
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If user already has cloud settings, return those (don't overwrite with local)
    if (existingSettings) {
      return {
        beginningBalance: Number(existingSettings.beginning_balance),
        dailyTargetR: Number(existingSettings.daily_target_r),
        slBudgetR: Number(existingSettings.sl_budget_r),
        theme: existingSettings.theme as 'light' | 'dark',
        pairs: existingSettings.pairs as string[],
        challenge: existingSettings.challenge as AppSettings['challenge']
      };
    }

    // No cloud settings exist, check for local settings to migrate
    const localSettingsStr = localStorage.getItem('sltp-settings');
    if (localSettingsStr) {
      try {
        const localSettings = JSON.parse(localSettingsStr) as AppSettings;
        // Upload local settings to cloud
        await supabaseService.saveSettings(localSettings);
        console.log('Local settings synced to cloud');
        return localSettings;
      } catch (e) {
        console.error('Error parsing local settings:', e);
      }
    }

    // No local settings, create defaults in cloud
    await supabaseService.saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
};

// LocalStorage implementation (fallback)
const localStorageService: SettingsService = {
  getSettings: async () => {
    const savedSettings = localStorage.getItem('sltp-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings) as AppSettings;
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings: async (settings: AppSettings) => {
    localStorage.setItem('sltp-settings', JSON.stringify(settings));
  },

  syncFromLocalStorage: async () => {
    // No-op for localStorage service, just return current settings
    return localStorageService.getSettings();
  }
};

// Export the appropriate service based on configuration
export const settingsService: SettingsService = isSupabaseConfigured() 
  ? supabaseService 
  : localStorageService;

// Helper to check which service is active
export const isUsingSupabaseSettings = () => isSupabaseConfigured();
