import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '../common';
import ReceiptModal from '../transaction/ReceiptModal';

/**
 * Transaction Detail Modal - Wrapper around ReceiptModal for history view
 * This component reuses the ReceiptModal component for consistency
 */
const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  // Check if transaction is pending (not synced)
  const isPending = transaction.synced === false;

  return (
    <ReceiptModal
      transaction={transaction}
      isOpen={isOpen}
      onClose={onClose}
      isPending={isPending}
    />
  );
};

export default TransactionDetailModal;
