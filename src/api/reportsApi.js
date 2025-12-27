import api from "./axiosConfig";

export const reportsApi = {
  /**
   * Get sales summary (today, this week, this month, all time)
   * @param {Object} params - Query parameters (start_date, end_date)
   * @returns {Promise} Sales summary data
   */
  getSalesSummary: async (params = {}) => {
    try {
      const response = await api.get("/reports/sales-summary", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      throw error;
    }
  },

  /**
   * Get top selling products
   * @param {Object} params - Query parameters (limit, start_date, end_date)
   * @returns {Promise} List of top products
   */
  getTopProducts: async (params = {}) => {
    try {
      const response = await api.get("/reports/top-products", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching top products:", error);
      throw error;
    }
  },

  /**
   * Get sales by payment method
   * @param {Object} params - Query parameters (start_date, end_date)
   * @returns {Promise} Sales breakdown by payment method
   */
  getSalesByPaymentMethod: async (params = {}) => {
    try {
      const response = await api.get("/reports/sales-by-payment", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales by payment method:", error);
      throw error;
    }
  },

  /**
   * Get daily sales for chart
   * @param {Object} params - Query parameters (start_date, end_date)
   * @returns {Promise} Daily sales data
   */
  getDailySales: async (params = {}) => {
    try {
      const response = await api.get("/reports/daily-sales", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      throw error;
    }
  },
};

export default reportsApi;
