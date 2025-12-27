import React, { useState, useEffect } from "react";
import { MainLayout } from "../components/layout";
import { Card, Button } from "../components/common";
import { FolderOpen, Plus, Pencil, Trash2 } from "lucide-react";
import categoryApi from "../api/categoryApi";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../contexts/NotificationContext";

const Categories = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) {
      return;
    }

    try {
      await categoryApi.deleteCategory(category.id);
      fetchCategories();
      toast.success("Kategori berhasil dihapus");

      // Add notification
      addNotification({
        type: 'info',
        title: 'Kategori Dihapus',
        message: `${category.name} telah dihapus`
      });
    } catch (err) {
      toast.error("Gagal menghapus kategori: " + err.message);

      // Add error notification
      addNotification({
        type: 'error',
        title: 'Gagal Menghapus Kategori',
        message: err.message
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.warning("Nama kategori harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      if (selectedCategory) {
        await categoryApi.updateCategory(selectedCategory.id, formData);
        toast.success("Kategori berhasil diupdate!");

        // Add notification
        addNotification({
          type: 'success',
          title: 'Kategori Diupdate',
          message: `${formData.name} telah diperbarui`
        });
      } else {
        await categoryApi.createCategory(formData);
        toast.success("Kategori berhasil ditambahkan!");

        // Add notification
        addNotification({
          type: 'success',
          title: 'Kategori Ditambahkan',
          message: `${formData.name} telah ditambahkan`
        });
      }

      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      toast.error("Error: " + err.message);

      // Add error notification
      addNotification({
        type: 'error',
        title: 'Gagal Menyimpan Kategori',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title="Categories">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Manage Categories
          </h2>
          <p className="text-neutral-600 mt-1">
            Kelola kategori produk Anda
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleAdd}>
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading categories...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">
              Error loading categories
            </p>
            <p className="text-neutral-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchCategories} variant="primary" size="sm">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Categories Table */}
      {!loading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">
                    Description
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">
                    Created At
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500">Belum ada kategori</p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAdd}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kategori
                      </Button>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-neutral-900">
                          {category.name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-neutral-600 text-sm">
                          {category.description || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-neutral-600 text-sm">
                          {category.created_at
                            ? new Date(category.created_at).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">
                {selectedCategory ? "Edit Category" : "Add Category"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nama kategori"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Deskripsi kategori (opsional)"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Categories;
