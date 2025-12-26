import { create } from "zustand";

const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  currentPage: 1,
  totalPages: 1,
  totalItems: 0,

  searchQuery: "",
  selectedCategory: null,
  viewMode: "table",

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPagination: ({ currentPage, totalPages, totalItems }) =>
    set({ currentPage, totalPages, totalItems }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setViewMode: (mode) => set({ viewMode: mode }),
  clearSelectedProduct: () => set({ selectedProduct: null }),
}));

export default useProductStore;
