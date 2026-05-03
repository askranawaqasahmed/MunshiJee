"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldOff, ShieldCheck, Trash2 } from "lucide-react";

interface AccountActionsProps {
  userId: string;
  userEmail: string;
  isActive: boolean;
}

export function AccountActions({ userId, userEmail, isActive }: AccountActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleStatus() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update status");
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account");
      }
      router.push("/users");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={isActive ? "outline" : "default"}
        size="sm"
        onClick={toggleStatus}
        disabled={busy}
      >
        {isActive ? (
          <>
            <ShieldOff className="h-4 w-4 mr-1" />
            Disable account
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4 mr-1" />
            Enable account
          </>
        )}
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          setDeleteOpen(true);
          setConfirmEmail("");
          setError(null);
        }}
        disabled={busy}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete account
      </Button>

      {error && <span className="text-sm text-red-600 ml-2">{error}</span>}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This permanently deletes the account, all invoices, customers,
              sales, payments, and notification history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-email">
              Type <span className="font-mono">{userEmail}</span> to confirm
            </Label>
            <Input
              id="confirm-email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={busy || confirmEmail !== userEmail}
            >
              {busy ? "Deleting…" : "Permanently delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
