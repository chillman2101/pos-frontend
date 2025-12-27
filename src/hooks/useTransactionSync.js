import { useState, useEffect, useCallback } from 'react';
import { dbHelpers } from '../db';
import transactionApi from '../api/transactionApi';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook for syncing offline transactions to the server
 * @returns {Object} Sync state and functions
 */
export const useTransactionSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const isOnline = useNetworkStatus();

  /**
   * Get the count of pending (unsynced) transactions
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const pending = await dbHelpers.getPendingTransactions();
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Error getting pending transaction count:', error);
    }
  }, []);

  /**
   * Sync pending transactions to the server
   */
  const syncTransactionsToServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // Get all pending transactions
      const pendingTransactions = await dbHelpers.getPendingTransactions();

      if (pendingTransactions.length === 0) {
        console.log('No pending transactions to sync');
        setLastSync(new Date().toISOString());
        return {
          success: true,
          successCount: 0,
          failedCount: 0,
          message: 'No pending transactions'
        };
      }

      console.log(`Syncing ${pendingTransactions.length} pending transactions...`);

      // Call bulk sync API
      const result = await transactionApi.bulkSyncTransactions(pendingTransactions);

      if (result.success && result.data) {
        const { success_count, failed_count, transactions, errors } = result.data;

        // Mark successful transactions as synced
        if (transactions && transactions.length > 0) {
          for (const syncedTx of transactions) {
            if (syncedTx.client_transaction_id) {
              await dbHelpers.markTransactionSynced(
                syncedTx.client_transaction_id,
                syncedTx
              );
            }
          }
        }

        // Handle failed transactions - rollback stock
        if (errors && errors.length > 0) {
          console.warn('⚠️ Rolling back stock for failed transactions:', errors);

          for (const errorItem of errors) {
            if (errorItem.client_transaction_id) {
              try {
                await dbHelpers.rollbackTransactionStock(errorItem.client_transaction_id);
                console.log(`✅ Stock rolled back for: ${errorItem.client_transaction_id}`);
              } catch (rollbackError) {
                console.error(`❌ Failed to rollback stock for ${errorItem.client_transaction_id}:`, rollbackError);
              }
            }
          }
        }

        // Update pending count
        await updatePendingCount();
        setLastSync(new Date().toISOString());

        return {
          success: true,
          successCount: success_count || 0,
          failedCount: failed_count || 0,
          warnings: result.data.warnings || [],
          errors: errors || [],
          message: `Synced ${success_count} transactions${failed_count > 0 ? `, ${failed_count} failed (stock rolled back)` : ''}`
        };
      }

      throw new Error('Sync failed: Invalid response from server');

    } catch (error) {
      console.error('Transaction sync error:', error);
      setSyncError(error.message);

      return {
        success: false,
        successCount: 0,
        failedCount: pendingCount,
        message: error.message || 'Sync failed',
        error
      };
    } finally {
      setIsSyncing(false);
    }
  }, [pendingCount, updatePendingCount]);

  /**
   * Manual sync trigger
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      return {
        success: false,
        message: 'Cannot sync while offline'
      };
    }

    return await syncTransactionsToServer();
  }, [isOnline, syncTransactionsToServer]);

  /**
   * Auto-sync when network comes back online
   */
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Network reconnected, auto-syncing transactions...');

      if (pendingCount > 0) {
        await syncTransactionsToServer();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingCount, syncTransactionsToServer]);

  /**
   * Update pending count on mount and when needed
   */
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    isSyncing,
    pendingCount,
    lastSync,
    syncError,
    syncTransactionsToServer,
    triggerSync,
    updatePendingCount
  };
};

export default useTransactionSync;
