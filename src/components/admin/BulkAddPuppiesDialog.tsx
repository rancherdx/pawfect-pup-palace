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

interface BulkAddPuppiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
}

const BulkAddPuppiesDialog: React.FC<BulkAddPuppiesDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [count, setCount] = useState(1);

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
