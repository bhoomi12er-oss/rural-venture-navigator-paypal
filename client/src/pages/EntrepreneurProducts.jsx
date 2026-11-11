import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle2,
  Tag,
  Boxes,
  Loader2,
} from 'lucide-react';

export default function EntrepreneurProducts() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: 'cookies',
    price: '',
    ingredients: '',
    availableQuantity: 100,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/products/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [token]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({
      productName: '',
      description: '',
      category: 'cookies',
      price: '',
      ingredients: '',
      availableQuantity: 100,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id || product.id);
    setFormData({
      productName: product.productName,
      description: product.description,
      category: product.category || 'cookies',
      price: product.price,
      ingredients: product.ingredients,
      availableQuantity: product.availableQuantity || 100,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.price || !formData.ingredients) {
      setErrorMessage('Please fill in product name, price, and ingredients');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const url = isEditing
        ? `http://localhost:5000/api/products/${currentProductId}`
        : 'http://localhost:5000/api/products';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchMyProducts();
      } else {
        setErrorMessage(data.message || 'Failed to save product');
      }
    } catch (err) {
      setErrorMessage('Server connection error while saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productToDelete._id || productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeleteModalOpen(false);
        setProductToDelete(null);
        fetchMyProducts();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-neutralGray shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl font-black text-brand-dark">Product Catalog & Inventory</h1>
          </div>
          <p className="text-xs text-brand-dark opacity-65 font-medium mt-1">
            Manage your rural millet products, update selling prices, and monitor stock availability.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenAdd}
          className="font-bold shadow-sm text-xs"
        >
          Add New Product / नया उत्पाद जोड़ें
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-xl border border-brand-neutralGray flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search your products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-brand-dark focus:outline-none"
          />
        </div>

        <div className="bg-brand-primaryLight/70 border border-brand-primary/20 p-4 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-brand-primary">Total Products:</span>
          <span className="text-xl font-black text-brand-primary">{products.length}</span>
        </div>
      </div>

      {/* Product List Table / Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-brand-neutralGray">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
          <span className="text-xs font-bold text-brand-dark opacity-60">Loading inventory...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-brand-neutralGray space-y-3">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-brand-dark">No products in your catalog yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click "Add New Product" to publish your millet cookies, crisps, or flour to the marketplace.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={Plus} className="font-bold">
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-neutralGray shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-light border-b border-brand-neutralGray text-brand-dark font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">PayPal Sandbox USD</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Ingredients</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutralGray/60 font-medium text-brand-dark">
                {filtered.map((prod) => {
                  const id = prod._id || prod.id;
                  const approxUSD = (prod.price * 0.012).toFixed(2);
                  const isLow = (prod.availableQuantity || 0) < 20;

                  return (
                    <tr key={id} className="hover:bg-brand-light/50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-sm text-brand-dark">
                        {prod.productName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-brand-primaryLight text-brand-primary px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-brand-primary text-sm">
                        ₹{prod.price}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                        ${approxUSD}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {prod.availableQuantity || 0} units {isLow && '(Low)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-stone-500 font-semibold" title={prod.ingredients}>
                        {prod.ingredients}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg border border-brand-neutralGray text-brand-dark hover:bg-brand-primaryLight hover:text-brand-primary transition-all inline-flex items-center"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(prod);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-brand-neutralGray text-stone-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all inline-flex items-center"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Product Details' : 'Add New Millet Product'}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveProduct}
              disabled={submitting}
              className="font-bold"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 py-2">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            id="p_name"
            label="Product Name (उत्पाद का नाम)"
            placeholder="e.g. Ragi Chocolate Almond Cookies"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Category (श्रेणी)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-brand-neutralGray text-xs font-bold text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="cookies">Cookies (कुकीज़)</option>
                <option value="snacks">Snacks / Crisps (स्नैक्स)</option>
                <option value="flour">Flour / Laddoo (आटा / लड्डू)</option>
                <option value="other">Other Traditional Food</option>
              </select>
            </div>

            <Input
              id="p_price"
              label="Selling Price (₹ प्रति पैकेट)"
              type="number"
              min="1"
              placeholder="35"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <Input
            id="p_stock"
            label="Available Stock Quantity (उपलब्ध पैकेट संख्या)"
            type="number"
            min="0"
            placeholder="100"
            value={formData.availableQuantity}
            onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Ingredients (सामग्री)
            </label>
            <textarea
              rows={2}
              placeholder="Ragi flour, Raw Almonds, Organic Jaggery, Pure Cow Ghee..."
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-brand-neutralGray text-xs font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Description (विवरण)
            </label>
            <textarea
              rows={2}
              placeholder="Crisp, tasty, nutrient-dense cookies rich in calcium and dietary fiber..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-brand-neutralGray text-xs font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Product Deletion"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} className="font-bold">
              Delete Product
            </Button>
          </div>
        }
      >
        <p className="text-sm font-semibold text-brand-dark py-2">
          Are you sure you want to remove <strong>"{productToDelete?.productName}"</strong> from your catalog?
          This will prevent new customer orders for this product.
        </p>
      </Modal>

    </div>
  );
}

