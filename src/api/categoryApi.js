import api from "./axiosConfig";

const categoryApi = {
  getCategories: async () => {
    try {
      const response = await api.get("/categories");
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

export default categoryApi;
