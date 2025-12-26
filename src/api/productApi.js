import api from "./axiosConfig";

export const productApi = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get("/products", { params });
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },
  createProduct: async (productData) => {
    try {
      const response = await api.post("/products", productData);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },
};

export default productApi;
