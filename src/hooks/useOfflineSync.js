import { useState, useEffect, useCallback } from 'react';
import { dbHelpers } from '../db';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import transactionApi from '../api/transactionApi';

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Sync data from server to IndexedDB
  const syncFromServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // Fetch all products from server (without pagination for offline storage)
      const productsResponse = await productApi.getProducts({ limit: 1000 });
      if (productsResponse.success && productsResponse.data) {
        await dbHelpers.saveProducts(productsResponse.data);
      }

      // Fetch all categories
      const categoriesResponse = await categoryApi.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        await dbHelpers.saveCategories(categoriesResponse.data);
      }

      const syncTime = new Date().toISOString();
      setLastSync(syncTime);

      console.log('✅ Offline sync completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Offline sync failed:', error);
      setSyncError(error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync pending operations to server
  const syncToServer = useCallback(async () => {
    try {
      // 1. Sync pending transactions (priority)
      const pendingTransactions = await dbHelpers.getPendingTransactions();
      if (pendingTransactions.length > 0) {
        console.log(`Syncing ${pendingTransactions.length} pending transactions...`);

        try {
          const result = await transactionApi.bulkSyncTransactions(pendingTransactions);

          if (result.success && result.data) {
            const { transactions, success_count } = result.data;

            // Mark synced transactions
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

            console.log(`✅ ${success_count} transactions synced successfully`);
          }
        } catch (error) {
          console.error('Failed to sync transactions:', error);
          // Continue with other syncs even if transactions fail
        }
      }

      // 2. Sync other pending operations (products, categories)
      const queue = await dbHelpers.getSyncQueue();
      if (queue.length === 0) {
        console.log('No other pending operations to sync');
        return true;
      }

      console.log(`Syncing ${queue.length} pending operations...`);

      for (const item of queue) {
        try {
          if (item.entity === 'product') {
            if (item.type === 'create') {
              await productApi.createProduct(item.data);
            } else if (item.type === 'update') {
              await productApi.updateProduct(item.data.id, item.data);
            } else if (item.type === 'delete') {
              await productApi.deleteProduct(item.data.id);
            }
          }
          // Remove from queue after successful sync
          await dbHelpers.clearSyncQueue();
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          // Keep in queue for retry
        }
      }

      console.log('✅ Sync to server completed');
      return true;
    } catch (error) {
      console.error('❌ Sync to server failed:', error);
      return false;
    }
  }, []);

  // Load last sync time on mount
  useEffect(() => {
    const loadLastSync = async () => {
      const lastProductsSync = await dbHelpers.getLastSync('products');
      setLastSync(lastProductsSync);
    };
    loadLastSync();
  }, []);

  // Auto sync when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Back online, syncing...');
      await syncToServer(); // Sync pending operations first
      await syncFromServer(); // Then fetch latest data
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncFromServer, syncToServer]);

  return {
    isSyncing,
    lastSync,
    syncError,
    syncFromServer,
    syncToServer
  };
};

export default useOfflineSync;
