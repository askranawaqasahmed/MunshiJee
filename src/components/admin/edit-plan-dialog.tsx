'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pencil } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  emailLimit: number;
  smsLimit: number;
  price: number;
  description: string;
}

interface EditPlanDialogProps {
  plan: Plan;
  onSuccess: () => void;
}

export function EditPlanDialog({ plan, onSuccess }: EditPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: plan.name,
    emailLimit: plan.emailLimit.toString(),
    smsLimit: plan.smsLimit.toString(),
    price: Number(plan.price).toString(),
    description: plan.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: plan.name,
        emailLimit: plan.emailLimit.toString(),
        smsLimit: plan.smsLimit.toString(),
        price: Number(plan.price).toString(),
        description: plan.description || '',
      });
      setMessage(null);
    }
  }, [open, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/subscription/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      setMessage({ type: 'success', text: 'Plan updated successfully!' });
      setTimeout(() => {
        setOpen(false);
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update plan. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit {plan.name} Plan</DialogTitle>
          <DialogDescription>
            Update plan details and pricing. Changes will affect all future subscriptions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {message && (
              <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailLimit">Email Limit</Label>
                <Input
                  id="emailLimit"
                  type="number"
                  min="0"
                  value={formData.emailLimit}
                  onChange={(e) => setFormData({ ...formData, emailLimit: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsLimit">SMS Limit</Label>
                <Input
                  id="smsLimit"
                  type="number"
                  min="0"
                  value={formData.smsLimit}
                  onChange={(e) => setFormData({ ...formData, smsLimit: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs./month)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
