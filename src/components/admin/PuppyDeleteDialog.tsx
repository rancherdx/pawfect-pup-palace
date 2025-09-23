
import React from 'react';
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * @interface PuppyDeleteDialogProps
 * @description Defines the props for the PuppyDeleteDialog component.
 */
interface PuppyDeleteDialogProps {
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Callback function to be invoked when the dialog is closed. */
  onClose: () => void;
  /** Callback function to be invoked when the deletion is confirmed. */
  onConfirm: () => void;
  /** A boolean indicating if the deletion operation is in progress. */
  isDeleting: boolean;
}

/**
 * @component PuppyDeleteDialog
 * @description A reusable alert dialog component to confirm the deletion of a puppy.
 * @param {PuppyDeleteDialogProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered alert dialog.
 */
const PuppyDeleteDialog: React.FC<PuppyDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the puppy
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Yes, delete puppy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PuppyDeleteDialog;
