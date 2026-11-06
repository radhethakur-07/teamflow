import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showClose={!isLoading}>
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger'
              ? 'bg-terracotta-100 text-terracotta-600'
              : 'bg-mustard-100 text-mustard-600'
          }`}
        >
          {variant === 'danger' ? (
            <Trash2 className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1">
          <h4 className="font-heading font-bold text-base text-warm-900">{title}</h4>
          <p className="text-xs text-warm-500 max-w-xs">{message}</p>
        </div>

        <div className="flex items-center gap-3 w-full pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            isLoading={isLoading}
            onClick={() => {
              onConfirm && onConfirm();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
