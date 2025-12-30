import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Pencil, Trash2 } from 'lucide-react';
import { Trade } from '../App';

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWithdraw: (amount: number, date: string) => void;
  withdrawals: Trade[];
  onUpdateWithdrawal: (id: string, amount: number, date: string) => void;
  onDeleteWithdrawal: (id: string) => void;
}

export function WithdrawalDialog({ 
  open, 
  onOpenChange, 
  onWithdraw, 
  withdrawals,
  onUpdateWithdrawal,
  onDeleteWithdrawal 
}: WithdrawalDialogProps) {
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    if (editingId) {
      // Update existing withdrawal
      onUpdateWithdrawal(editingId, parseFloat(formData.amount), formData.date);
      setEditingId(null);
    } else {
      // Create new withdrawal
      onWithdraw(parseFloat(formData.amount), formData.date);
    }

    // Reset form
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (withdrawal: Trade) => {
    setEditingId(withdrawal.id);
    setFormData({
      amount: Math.abs(withdrawal.pnl).toString(),
      date: withdrawal.date,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-popover border-border max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Withdrawal' : 'Withdraw Funds'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="1000.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              autoFocus
            />
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

          <div className="flex gap-2 pt-2">
            {editingId ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Close
                </Button>
                <Button type="submit" className="flex-1">
                  Add Withdrawal
                </Button>
              </>
            )}
          </div>
        </form>

        {/* List of existing withdrawals */}
        {withdrawals.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Withdrawal History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {withdrawals.map((withdrawal) => (
                <div 
                  key={withdrawal.id}
                  className="bg-muted border border-border rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">${Math.abs(withdrawal.pnl).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(withdrawal.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(withdrawal)}
                      className="size-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteWithdrawal(withdrawal.id)}
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
