import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PuppyStatus } from '@/types';
import { Loader2 } from 'lucide-react';

/**
 * @interface BulkUpdateStatusDialogProps
 * @description Defines the props for the BulkUpdateStatusDialog component.
 */
interface BulkUpdateStatusDialogProps {
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Callback function to be invoked when the dialog is closed. */
  onClose: () => void;
  /** Callback function to be invoked when the user confirms the status update. */
  onConfirm: (newStatus: PuppyStatus) => void;
  /** A boolean indicating if the update operation is in progress. */
  isUpdating: boolean;
  /** The number of puppies selected for the bulk update. */
  selectedCount: number;
}

/**
 * @constant PUPPY_STATUS_VALUES
 * @description An array of all possible statuses a puppy can have.
 */
const PUPPY_STATUS_VALUES: PuppyStatus[] = ["Available", "Reserved", "Sold", "Not For Sale"];

/**
 * @component BulkUpdateStatusDialog
 * @description A dialog component that allows an admin to update the status of multiple selected puppies at once.
 * @param {BulkUpdateStatusDialogProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered dialog for bulk status updates.
 */
const BulkUpdateStatusDialog: React.FC<BulkUpdateStatusDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isUpdating,
  selectedCount,
}) => {
  const [newStatus, setNewStatus] = useState<PuppyStatus | ''>('');

  /**
   * Handles the confirmation of the status update.
   * It calls the onConfirm prop with the newly selected status if one has been chosen.
   */
  const handleConfirm = () => {
    if (newStatus) {
      onConfirm(newStatus);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Puppy Status</DialogTitle>
          <DialogDescription>
            You are about to update the status for {selectedCount} selected puppies. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="status-select">New Status</Label>
          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as PuppyStatus)}>
            <SelectTrigger id="status-select">
              <SelectValue placeholder="Select a new status" />
            </SelectTrigger>
            <SelectContent>
              {PUPPY_STATUS_VALUES.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!newStatus || isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUpdateStatusDialog;
