import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    beginningBalance: number;
    dailyTargetR: number;
    slBudgetR: number;
    theme: 'light' | 'dark';
    pairs: string[];
  };
  onSaveSettings: (settings: { beginningBalance: number; dailyTargetR: number; slBudgetR: number; theme: 'light' | 'dark'; pairs: string[] }) => void;
}

export function SettingsDialog({ open, onOpenChange, settings, onSaveSettings }: SettingsDialogProps) {
  const [formData, setFormData] = useState({
    beginningBalance: settings.beginningBalance.toString(),
    dailyTargetR: settings.dailyTargetR.toString(),
    slBudgetR: settings.slBudgetR.toString(),
    theme: settings.theme,
    pairs: settings.pairs
  });
  const [newPair, setNewPair] = useState('');

  useEffect(() => {
    setFormData({
      beginningBalance: settings.beginningBalance.toString(),
      dailyTargetR: settings.dailyTargetR.toString(),
      slBudgetR: settings.slBudgetR.toString(),
      theme: settings.theme,
      pairs: settings.pairs
    });
  }, [settings]);

  const handleAddPair = () => {
    if (newPair.trim() && !formData.pairs.includes(newPair.trim())) {
      setFormData({
        ...formData,
        pairs: [...formData.pairs, newPair.trim()]
      });
      setNewPair('');
    }
  };

  const handleRemovePair = (pair: string) => {
    setFormData({
      ...formData,
      pairs: formData.pairs.filter(p => p !== pair)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.beginningBalance || !formData.dailyTargetR || !formData.slBudgetR) {
      return;
    }

    onSaveSettings({
      beginningBalance: parseFloat(formData.beginningBalance),
      dailyTargetR: parseFloat(formData.dailyTargetR),
      slBudgetR: parseFloat(formData.slBudgetR),
      theme: formData.theme,
      pairs: formData.pairs
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">Configure your trading settings</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beginningBalance">Beginning Balance ($)</Label>
            <Input
              id="beginningBalance"
              type="number"
              step="0.01"
              placeholder="10000.00"
              value={formData.beginningBalance}
              onChange={(e) => setFormData({ ...formData, beginningBalance: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyTargetR">R Daily Target (%)</Label>
            <Input
              id="dailyTargetR"
              type="number"
              step="0.1"
              placeholder="2.0"
              value={formData.dailyTargetR}
              onChange={(e) => setFormData({ ...formData, dailyTargetR: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">Target profit in R per day</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slBudgetR">R Budget for SL (%)</Label>
            <Input
              id="slBudgetR"
              type="number"
              step="0.1"
              placeholder="1.0"
              value={formData.slBudgetR}
              onChange={(e) => setFormData({ ...formData, slBudgetR: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">Maximum loss tolerance in R per day</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) => setFormData({ ...formData, theme: value as 'light' | 'dark' })}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select a theme">{formData.theme === 'light' ? 'Light' : 'Dark'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trading Pairs</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. BTC/USD"
                value={newPair}
                onChange={(e) => setNewPair(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPair();
                  }
                }}
              />
              <Button type="button" onClick={handleAddPair} variant="outline">Add</Button>
            </div>
            <div className="bg-muted border border-border rounded-lg max-h-40 overflow-y-auto">
              {formData.pairs.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No pairs added yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {formData.pairs.map(pair => (
                    <div 
                      key={pair} 
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{pair}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePair(pair)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${pair}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.pairs.length} {formData.pairs.length === 1 ? 'pair' : 'pairs'} added
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}