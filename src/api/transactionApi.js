import api from "./axiosConfig";

export const transactionApi = {
  /**
   * Create a new transaction
   * @param {Object} txData - Transaction data with items, payment info, etc.
   * @returns {Promise} API response
   */
  createTransaction: async (txData) => {
    try {
      const response = await api.post("/transactions", txData);
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  /**
   * Bulk sync offline transactions
   * @param {Array} transactions - Array of transaction objects
   * @returns {Promise} Bulk sync response with success/failure counts
   */
  bulkSyncTransactions: async (transactions) => {
    try {
      const response = await api.post("/transactions/bulk-sync", {
        transactions,
      });
      return response.data;
    } catch (error) {
      console.error("Error syncing transactions:", error);
      throw error;
    }
  },

  /**
   * Get all transactions with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, start_date, end_date, payment_method, search)
   * @returns {Promise} List of transactions with pagination info
   */
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get("/transactions", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  /**
   * Get a single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise} Transaction details
   */
  getTransactionById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
  },

  /**
   * Cancel a transaction (restore stock)
   * @param {string} id - Transaction ID
   * @returns {Promise} API response
   */
  cancelTransaction: async (id) => {
    try {
      const response = await api.patch(`/transactions/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      throw error;
    }
  },
};

export default transactionApi;
