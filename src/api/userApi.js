import api from "./axiosConfig";

export const userApi = {
  /**
   * Get all users with pagination and filters
   * @param {Object} params - Query parameters (page, limit, role, search)
   * @returns {Promise} List of users
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Get a single user by ID
   * @param {string} id - User ID
   * @returns {Promise} User details
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} Created user
   */
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise} Deletion result
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  /**
   * Reset user password
   * @param {string} id - User ID
   * @param {Object} passwordData - New password data
   * @returns {Promise} Reset result
   */
  resetPassword: async (id, passwordData) => {
    try {
      const response = await api.patch(`/users/${id}/reset-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },
};

export default userApi;
