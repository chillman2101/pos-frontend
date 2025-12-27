import Dexie from 'dexie';

// Initialize IndexedDB
export const db = new Dexie('POSDatabase');

// Define database schema
db.version(1).stores({
  products: 'id, name, sku, category_id, price, stock, is_active',
  categories: 'id, name',
  transactions: 'id, transaction_code, client_transaction_id, final_amount, payment_method, synced, created_at',
  syncQueue: '++id, type, entity, data, timestamp',
  metadata: 'key, value'
});

// Helper functions
export const dbHelpers = {
  // Products
  async saveProducts(products) {
    await db.products.clear();
    await db.products.bulkAdd(products);
    await db.metadata.put({ key: 'products_last_sync', value: new Date().toISOString() });
  },

  async getProducts(filters = {}) {
    let collection = db.products.toCollection();

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      collection = collection.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category_id) {
      collection = collection.filter(p => p.category_id === filters.category_id);
    }

    const allFiltered = await collection.toArray();

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const paginated = allFiltered.slice(offset, offset + limit);

    return {
      data: paginated,
      total: allFiltered.length,
      page,
      limit
    };
  },

  async getProductById(id) {
    return await db.products.get(id);
  },

  async addProduct(product) {
    await db.products.add(product);
    await this.addToSyncQueue('create', 'product', product);
  },

  async updateProduct(id, data) {
    await db.products.update(id, data);
    await this.addToSyncQueue('update', 'product', { id, ...data });
  },

  async deleteProduct(id) {
    await db.products.delete(id);
    await this.addToSyncQueue('delete', 'product', { id });
  },

  // Stock Management
  async updateProductStock(productId, quantity, operation = 'subtract') {
    try {
      const product = await db.products.get(productId);

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      const newStock = operation === 'subtract'
        ? product.stock - quantity
        : product.stock + quantity;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
      }

      await db.products.update(productId, { stock: newStock });

      console.log(`📦 Stock updated for ${product.name}: ${product.stock} → ${newStock}`);

      return newStock;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  async bulkUpdateStock(items, operation = 'subtract') {
    try {
      const updates = [];

      for (const item of items) {
        const newStock = await this.updateProductStock(
          item.product_id,
          item.quantity,
          operation
        );
        updates.push({ product_id: item.product_id, new_stock: newStock });
      }

      return updates;
    } catch (error) {
      console.error('Error in bulk stock update:', error);
      throw error;
    }
  },

  // Categories
  async saveCategories(categories) {
    await db.categories.clear();
    await db.categories.bulkAdd(categories);
    await db.metadata.put({ key: 'categories_last_sync', value: new Date().toISOString() });
  },

  async getCategories() {
    return await db.categories.toArray();
  },

  // Sync Queue
  async addToSyncQueue(type, entity, data) {
    await db.syncQueue.add({
      type,
      entity,
      data,
      timestamp: new Date().toISOString()
    });
  },

  async getSyncQueue() {
    return await db.syncQueue.toArray();
  },

  async clearSyncQueue() {
    await db.syncQueue.clear();
  },

  // Metadata
  async getLastSync(key) {
    const meta = await db.metadata.get(`${key}_last_sync`);
    return meta ? meta.value : null;
  },

  async setMetadata(key, value) {
    await db.metadata.put({ key, value });
  },

  async getMetadata(key) {
    const meta = await db.metadata.get(key);
    return meta ? meta.value : null;
  },

  // Transactions
  async saveTransaction(transaction, stockUpdates = []) {
    try {
      await db.transactions.add({
        ...transaction,
        synced: false,
        stock_updates: stockUpdates, // Store stock changes for rollback
        created_at: transaction.created_at || new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  },

  async getTransactions(filters = {}) {
    let collection = db.transactions.toCollection();

    // Apply filters
    if (filters.payment_method) {
      collection = collection.filter(t => t.payment_method === filters.payment_method);
    }

    if (filters.synced !== undefined) {
      collection = collection.filter(t => t.synced === filters.synced);
    }

    if (filters.start_date) {
      collection = collection.filter(t => new Date(t.created_at) >= new Date(filters.start_date));
    }

    if (filters.end_date) {
      collection = collection.filter(t => new Date(t.created_at) <= new Date(filters.end_date));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      collection = collection.filter(t =>
        t.transaction_code?.toLowerCase().includes(searchLower) ||
        t.client_transaction_id?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at descending (newest first)
    const allFiltered = await collection.toArray();
    allFiltered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const paginated = allFiltered.slice(offset, offset + limit);

    return {
      data: paginated,
      total: allFiltered.length,
      page,
      limit,
      total_pages: Math.ceil(allFiltered.length / limit)
    };
  },

  async getTransactionById(id) {
    return await db.transactions.get(id);
  },

  async getTransactionByClientId(clientTransactionId) {
    return await db.transactions
      .where('client_transaction_id')
      .equals(clientTransactionId)
      .first();
  },

  async getPendingTransactions() {
    return await db.transactions
      .where('synced')
      .equals(false)
      .toArray();
  },

  async markTransactionSynced(clientTransactionId, serverData = {}) {
    try {
      const transaction = await this.getTransactionByClientId(clientTransactionId);

      if (transaction) {
        await db.transactions.update(transaction.id, {
          synced: true,
          id: serverData.id || transaction.id,
          transaction_code: serverData.transaction_code || transaction.transaction_code,
          synced_at: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('Error marking transaction as synced:', error);
      throw error;
    }
  },

  async clearSyncedTransactions() {
    const syncedTransactions = await db.transactions
      .where('synced')
      .equals(true)
      .toArray();

    for (const tx of syncedTransactions) {
      await db.transactions.delete(tx.id);
    }
  },

  async rollbackTransactionStock(clientTransactionId) {
    try {
      const transaction = await this.getTransactionByClientId(clientTransactionId);

      if (!transaction || !transaction.stock_updates) {
        console.warn('No stock updates to rollback for transaction:', clientTransactionId);
        return false;
      }

      // Restore stock (add back the quantities that were subtracted)
      for (const update of transaction.stock_updates) {
        await this.updateProductStock(update.product_id, update.quantity, 'add');
      }

      console.log('✅ Stock rollback completed for transaction:', clientTransactionId);

      // Delete the failed transaction
      await db.transactions.delete(transaction.id);

      return true;
    } catch (error) {
      console.error('Error rolling back stock:', error);
      throw error;
    }
  }
};

export default db;
