import React from "react";
import { MainLayout } from "../components/layout";
import { Card, Button } from "../components/common";
import { Grid, Package, Plus, Table } from "lucide-react";
import ProductTable from "../components/products/ProductTable";
import ProductGrid from "../components/products/ProductGrid";
import { useEffect } from "react";
import productApi from "../api/productApi";

const Products = () => {
  const [viewMode, setViewMode] = React.useState("table"); // 'table' or 'grid'
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // call API
      const response = await productApi.getProducts({
        page: 1,
        limit: 100,
      });
      console.log(response);
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log("error fetching products:", error);
      setError(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) {
      return;
    }

    try {
      await productApi.deleteProduct(product.id);
      // Refresh list setelah delete
      fetchProducts();
      alert("Produk berhasil dihapus");
    } catch (err) {
      alert("Gagal menghapus produk: " + err.message);
    }
  };

  return (
    <MainLayout title="Products">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Manage Products
          </h2>
          <p className="text-neutral-600 mt-1">
            Kelola produk dan inventory Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table className="w-4 h-4" />
            Table
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
            Grid
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Placeholder Content - Anda akan coding di sini! */}
      <Card>
        {viewMode === "table" ? (
          <ProductTable
            products={products}
            onEdit={(product) => console.log("Edit:", product)}
            onDelete={handleDelete}
          />
        ) : (
          <ProductGrid
            products={products}
            onEdit={(product) => console.log("Edit:", product)}
            onDelete={handleDelete}
          />
        )}
      </Card>
    </MainLayout>
  );
};

export default Products;
