import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-divine-950 p-6 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-medium">Delete Conversation</h3>
        </div>

        <div className="mt-3 space-y-3">
          <p>Are you sure you want to delete this conversation?</p>
          <p className="text-amber-600 dark:text-amber-500 text-sm font-medium">
            This will also affect your mood history visualization as emotional data from this conversation will be removed.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;