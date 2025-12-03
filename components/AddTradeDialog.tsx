import { useState } from 'react';
import { Trade } from '../App';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrade: (trade: Omit<Trade, 'id'>) => void;
  pairs: string[];
}

export function AddTradeDialog({ open, onOpenChange, onAddTrade, pairs }: AddTradeDialogProps) {
  const [formData, setFormData] = useState({
    pair: '',
    direction: 'long' as 'long' | 'short',
    pnl: '',
    fee: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [feeError, setFeeError] = useState<string | null>(null);
  const [pnlError, setPnlError] = useState<string | null>(null);

  // Helper function to evaluate formulas like "150+50-20" or "0.5+0.3+0.2"
  const evaluateFormula = (formula: string): number | null => {
    try {
      // Remove all whitespace
      const cleaned = formula.replace(/\s/g, '');
      
      // Check if it's just a number (including negative)
      if (/^-?\d*\.?\d+$/.test(cleaned)) {
        return parseFloat(cleaned);
      }
      
      // Check if it's a valid formula (numbers separated by + or -)
      if (/^-?\d*\.?\d+([\+\-]\d*\.?\d+)+$/.test(cleaned)) {
        // Split by operators while keeping them
        const tokens = cleaned.match(/-?\d*\.?\d+/g);
        if (!tokens) return null;
        
        return tokens.reduce((sum, token) => sum + parseFloat(token), 0);
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const calculatedFee = evaluateFormula(formData.fee);
  const calculatedPnl = evaluateFormula(formData.pnl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pair || !formData.pnl || !formData.fee) {
      return;
    }

    const pnlValue = evaluateFormula(formData.pnl);
    if (pnlValue === null) {
      setPnlError('Invalid P&L format. Use a number or formula (e.g., 150+50-20)');
      return;
    }

    const feeValue = evaluateFormula(formData.fee);
    if (feeValue === null) {
      setFeeError('Invalid fee format. Use a number or sum (e.g., 0.5+0.3+0.2)');
      return;
    }

    setPnlError(null);
    setFeeError(null);

    onAddTrade({
      pair: formData.pair.toUpperCase(),
      direction: formData.direction,
      pnl: pnlValue,
      fee: feeValue,
      date: formData.date,
      notes: formData.notes || undefined
    });

    // Reset form
    setFormData({
      pair: '',
      direction: 'long',
      pnl: '',
      fee: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-popover border-border overflow-hidden" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="pair">Pair</Label>
            <Select
              value={formData.pair}
              onValueChange={(value) => setFormData({ ...formData, pair: value })}
            >
              <SelectTrigger id="pair">
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                {pairs.map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select
              value={formData.direction}
              onValueChange={(value: 'long' | 'short') => setFormData({ ...formData, direction: value })}
            >
              <SelectTrigger id="direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pnl">P&L</Label>
              <Input
                id="pnl"
                type="text"
                placeholder="150 or 100+50-20"
                value={formData.pnl}
                onChange={(e) => {
                  setFormData({ ...formData, pnl: e.target.value });
                  setPnlError(null);
                }}
                required
                className={pnlError ? 'border-red-500' : ''}
              />
              {formData.pnl && calculatedPnl !== null && /[\+\-]/.test(formData.pnl) && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  = ${calculatedPnl.toFixed(2)}
                </p>
              )}
              {pnlError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {pnlError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Fee</Label>
              <Input
                id="fee"
                type="text"
                placeholder="2.50 or 0.5+0.3+0.2"
                value={formData.fee}
                onChange={(e) => {
                  setFormData({ ...formData, fee: e.target.value });
                  setFeeError(null);
                }}
                required
                className={feeError ? 'border-red-500' : ''}
              />
              {formData.fee && calculatedFee !== null && formData.fee.includes('+') && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  = ${calculatedFee.toFixed(2)}
                </p>
              )}
              {feeError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {feeError}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full max-w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this trade..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 bg-black text-white hover:bg-black/80 border-border">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
              Add Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}