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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pair || !formData.pnl || !formData.fee) {
      return;
    }

    onAddTrade({
      pair: formData.pair.toUpperCase(),
      direction: formData.direction,
      pnl: parseFloat(formData.pnl),
      fee: parseFloat(formData.fee),
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
                type="number"
                step="0.01"
                placeholder="150.00"
                value={formData.pnl}
                onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Fee</Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                placeholder="2.50"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                required
              />
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