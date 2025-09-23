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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * @interface BulkAddPuppiesDialogProps
 * @description Defines the props for the BulkAddPuppiesDialog component.
 */
interface BulkAddPuppiesDialogProps {
  /**
   * @property {boolean} isOpen - Controls whether the dialog is open or closed.
   */
  isOpen: boolean;
  /**
   * @property {() => void} onClose - Callback function to be invoked when the dialog is requested to be closed.
   */
  onClose: () => void;
  /**
   * @property {(count: number) => void} onConfirm - Callback function to be invoked when the user confirms the number of puppies to add.
   * @param {number} count - The number of puppies to add.
   */
  onConfirm: (count: number) => void;
}

/**
 * @component BulkAddPuppiesDialog
 * @description A dialog component that allows an admin to specify a number of puppies to add to a litter in bulk.
 * @param {BulkAddPuppiesDialogProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered dialog component.
 */
const BulkAddPuppiesDialog: React.FC<BulkAddPuppiesDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [count, setCount] = useState(1);

  /**
   * Handles the confirmation action, calling the onConfirm callback with the selected count.
   */
  const handleConfirm = () => {
    if (count > 0) {
      onConfirm(count);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Puppies to Litter</DialogTitle>
          <DialogDescription>
            How many puppies would you like to add to this litter?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="puppy-count">Number of Puppies</Label>
          <Input
            id="puppy-count"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={count <= 0}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddPuppiesDialog;
