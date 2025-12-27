import React, { useState, useEffect, useRef } from "react";
import { MainLayout } from "../components/layout";
import { Card, Button } from "../components/common";
import {
  Package,
  Plus,
  Table as TableIcon,
  Grid as GridIcon,
  Filter,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import ProductTable from "../components/products/ProductTable";
import ProductGrid from "../components/products/ProductGrid";
import ProductModal from "../components/products/ProductModal";
import SearchBar from "../components/products/SearchBar";
import productApi from "../api/productApi";
import categoryApi from "../api/categoryApi";
import { dbHelpers } from "../db";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../contexts/NotificationContext";

const Products = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [viewMode, setViewMode] = React.useState("table"); // 'table' or 'grid'
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Track previous search/filter to detect changes
  const prevSearch = useRef("");
  const prevCategory = useRef("");

  // Offline mode hooks
  const isOnline = useNetworkStatus();
  const { isSyncing, lastSync, syncFromServer } = useOfflineSync();
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Fetch categories only once on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Wrapper for sync with notification
  const handleSync = async () => {
    try {
      await syncFromServer();
      addNotification({
        type: 'success',
        title: 'Sync Berhasil',
        message: 'Data berhasil di-sync dengan server'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Sync Gagal',
        message: 'Gagal sync data: ' + err.message
      });
    }
  };

  // Initial sync on mount if online
  useEffect(() => {
    const doInitialSync = async () => {
      if (isOnline && navigator.onLine) {
        console.log("🔄 Running initial sync...");
        try {
          await syncFromServer();
        } catch (err) {
          console.error("Initial sync failed:", err);
          // Don't show error, just continue
        }
      } else {
        console.log("⏭️ Skipping initial sync (offline)");
      }
    };

    doInitialSync();
  }, []); // Only run on mount

  // Main useEffect: handle search, filter, and pagination
  useEffect(() => {
    // Check if search or category changed
    const searchChanged = searchQuery !== prevSearch.current;
    const categoryChanged = selectedCategory !== prevCategory.current;

    if (searchChanged || categoryChanged) {
      // Update refs
      prevSearch.current = searchQuery;
      prevCategory.current = selectedCategory;

      // Reset to page 1 if not already
      if (currentPage !== 1) {
        setCurrentPage(1);
        return; // Don't fetch, wait for page to change
      }
    }

    // Fetch products
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build params object
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Add search query if exists
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Add category filter if exists
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      console.log("🔍 Fetching products, isOnline:", isOnline, "params:", params);

      // Try fetching from server if online
      if (isOnline) {
        try {
          const response = await productApi.getProducts(params);
          console.log("✅ Server response:", response);

          if (response.success) {
            // Success response from server (even if data is empty array)
            setProducts(response.data || []);
            setIsOfflineMode(false);
            setError(null); // Clear any previous errors

            // Update pagination info
            if (response.pagination) {
              setTotalPages(response.pagination.total_pages || 1);
              setTotalItems(response.pagination.total_rows || (response.data || []).length);
            } else {
              setTotalItems((response.data || []).length);
              setTotalPages(Math.ceil((response.data || []).length / itemsPerPage));
            }
            setLoading(false);
            return; // Success, exit (even with empty data)
          } else {
            console.warn("⚠️ Server returned unsuccessful response");
          }
        } catch (serverError) {
          console.error("❌ Server fetch failed:", serverError);
          // Check if it's a network error - if so, fall back to offline
          const isNetworkError = serverError.message?.includes('Network') ||
                                 serverError.message?.includes('ERR_') ||
                                 !navigator.onLine;

          if (isNetworkError) {
            console.log("🔄 Detected network error, falling back to IndexedDB");
            // Fall through to offline mode below
          } else {
            // Server error but we're online - show error
            setError("Server error. Please try again later.");
            setProducts([]);
            setLoading(false);
            return;
          }
        }
      }

      // Offline mode: fetch from IndexedDB
      console.log("📴 Using offline mode (IndexedDB)");
      setIsOfflineMode(true);

      const offlineResult = await dbHelpers.getProducts({
        search: searchQuery,
        category_id: selectedCategory,
        page: currentPage,
        limit: itemsPerPage
      });

      console.log("📦 IndexedDB result:", offlineResult);

      setProducts(offlineResult.data || []);
      setTotalPages(Math.ceil((offlineResult.total || 0) / itemsPerPage) || 1);
      setTotalItems(offlineResult.total || 0);

      // Only show offline error if there's NO data in IndexedDB
      if (!offlineResult.data || offlineResult.data.length === 0) {
        setError("📴 Mode Offline: Belum ada data tersimpan. Silakan online dan sync data terlebih dahulu.");
      } else {
        setError(null);
      }

    } catch (error) {
      console.error("💥 Error in fetchProducts:", error);
      setError(error.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      if (isOnline) {
        const response = await categoryApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
          return;
        }
      }

      // Fallback to offline
      const offlineCategories = await dbHelpers.getCategories();
      setCategories(offlineCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Try offline as last resort
      try {
        const offlineCategories = await dbHelpers.getCategories();
        setCategories(offlineCategories);
      } catch (offlineErr) {
        console.error("Offline fetch also failed:", offlineErr);
      }
    }
  };

  // Handle Add Product
  const handleAddProduct = () => {
    setSelectedProduct(null); // Clear selected product
    setIsModalOpen(true);
  };

  // Handle Edit Product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle Delete Product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) {
      return;
    }

    try {
      await productApi.deleteProduct(product.id);
      // Refresh list
      fetchProducts();
      toast.success("Produk berhasil dihapus");

      // Add notification
      addNotification({
        type: 'info',
        title: 'Produk Dihapus',
        message: `${product.name} telah dihapus dari inventory`
      });
    } catch (err) {
      toast.error("Gagal menghapus produk: " + err.message);

      // Add error notification
      addNotification({
        type: 'error',
        title: 'Gagal Menghapus Produk',
        message: `Gagal menghapus ${product.name}: ${err.message}`
      });
    }
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (selectedProduct) {
        // Update existing product
        await productApi.updateProduct(selectedProduct.id, formData);
        toast.success("Produk berhasil diupdate!");

        // Add notification
        addNotification({
          type: 'success',
          title: 'Produk Diupdate',
          message: `${formData.name} telah diperbarui`
        });
      } else {
        // Create new product
        await productApi.createProduct(formData);
        toast.success("Produk berhasil ditambahkan!");

        // Add notification
        addNotification({
          type: 'success',
          title: 'Produk Ditambahkan',
          message: `${formData.name} telah ditambahkan ke inventory`
        });
      }

      // Close modal & refresh list
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("Error: " + err.message);

      // Add error notification
      addNotification({
        type: 'error',
        title: selectedProduct ? 'Gagal Update Produk' : 'Gagal Tambah Produk',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Note: Filtering now done server-side via API params

  return (
    <MainLayout title="Products">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Manage Products
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-neutral-600 text-sm sm:text-base">
              Kelola produk dan inventory Anda
            </p>
            {/* Offline Indicator */}
            {isOfflineMode && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline Mode
              </span>
            )}
            {/* Syncing Indicator */}
            {isSyncing && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Syncing...
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Toggle View */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "table" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
          </div>

          {/* Sync Button */}
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''} sm:mr-1`} />
              <span className="hidden sm:inline">Sync</span>
            </Button>
          )}

          {/* Add Product Button */}
          <Button variant="primary" size="sm" onClick={handleAddProduct} className="flex-1 sm:flex-initial">
            <Plus className="w-5 h-5 mr-2" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar - Always visible */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Cari produk (nama atau SKU)..."
          />
        </div>

        {/* Category Filter */}
        <div className="w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="
              w-full px-4 py-2.5
              border border-neutral-300 rounded-lg
              bg-white text-neutral-900
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              transition-all duration-200
            "
          >
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedCategory) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-4">
          <p className="text-sm text-neutral-600">
            Menampilkan{" "}
            <span className="font-semibold text-neutral-900">
              {products.length}
            </span>{" "}
            dari <span className="font-semibold">{totalItems}</span> produk
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading products...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">
              Error loading products
            </p>
            <p className="text-neutral-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchProducts} variant="primary" size="sm">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Product List */}
      {!loading && !error && (
        <>
          <Card>
            {products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Belum Ada Produk
                </h3>
                <p className="text-neutral-600 mb-6">
                  {searchQuery || selectedCategory
                    ? "Tidak ada produk yang sesuai dengan filter."
                    : "Mulai tambahkan produk pertama Anda."}
                </p>
                {!searchQuery && !selectedCategory && (
                  <Button variant="primary" size="md" onClick={handleAddProduct}>
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Produk Pertama
                  </Button>
                )}
              </div>
            ) : (
              /* Product Table/Grid */
              viewMode === "table" ? (
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ) : (
                <ProductGrid
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              )
            )}
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Halaman <span className="font-semibold">{currentPage}</span>{" "}
                dari <span className="font-semibold">{totalPages}</span>
              </p>

              <div className="flex gap-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
};

export default Products;
