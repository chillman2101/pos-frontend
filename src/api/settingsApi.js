import api from "./axiosConfig";

export const settingsApi = {
  /**
   * Get all settings
   * @returns {Promise} Settings grouped by category
   */
  getSettings: async () => {
    try {
      const response = await api.get("/settings");
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },

  /**
   * Update settings
   * @param {Object} settings - Settings object grouped by category
   * @returns {Promise} Update result
   */
  updateSettings: async (settings) => {
    try {
      const response = await api.put("/settings", settings);
      return response.data;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  },

  /**
   * Initialize default settings
   * @returns {Promise} Initialization result
   */
  initializeDefaults: async () => {
    try {
      const response = await api.post("/settings/initialize");
      return response.data;
    } catch (error) {
      console.error("Error initializing settings:", error);
      throw error;
    }
  },
};

export default settingsApi;
