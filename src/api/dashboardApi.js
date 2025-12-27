import api from "./axiosConfig";

export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats with today and yesterday comparisons
   */
  getStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Get recent transactions (today)
   * @returns {Promise} List of recent transactions
   */
  getRecentTransactions: async () => {
    try {
      const response = await api.get("/dashboard/recent-transactions");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      throw error;
    }
  },

  /**
   * Get low stock products
   * @returns {Promise} List of products with low stock
   */
  getLowStockProducts: async () => {
    try {
      const response = await api.get("/dashboard/low-stock");
      return response.data;
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      throw error;
    }
  },
};

export default dashboardApi;
