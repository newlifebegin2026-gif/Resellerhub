import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product } from '../../types';
import {
  Tag,
  Plus,
  Star,
  Edit2,
  Trash2,
  Check,
  Search,
  Package,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminProducts();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setIsDefault(products.length === 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setDescription(p.description || '');
    setIsDefault(p.isDefault);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setFormError('Please enter a valid price in BDT.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          isDefault,
        });
        showToast(`Product "${name.trim()}" updated successfully!`);
      } else {
        await api.createProduct({
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
          isDefault,
        });
        showToast(`New product "${name.trim()}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, pName: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${pName}"?`)) return;
    try {
      await api.deleteProduct(id);
      showToast(`Product "${pName}" deleted.`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  const handleSetDefault = async (id: string, pName: string) => {
    try {
      await api.setDefaultProduct(id);
      showToast(`"${pName}" is now the default product for all resellers!`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to set default product.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const defaultProduct = products.find((p) => p.isDefault);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Product Catalog & Default Selection</h2>
              <p className="text-xs text-slate-500">
                Manage products available in the reseller order dropdown and assign the primary default product.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Active Default Product Highlight Box */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-md">
                Active Default Product
              </span>
              <span className="text-xs text-slate-500">(Auto-selected for resellers on order entry)</span>
            </div>
            {defaultProduct ? (
              <div className="mt-1">
                <span className="text-sm font-bold text-slate-900">{defaultProduct.name}</span>
                <span className="text-sm font-semibold text-indigo-600 ml-2">৳{defaultProduct.price.toLocaleString('en-IN')}</span>
                {defaultProduct.description && (
                  <p className="text-xs text-slate-600 mt-0.5">{defaultProduct.description}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1">No default product selected yet. Choose one from below.</p>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 max-w-xs flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>When resellers open the order form, this product is auto-selected by default unless they pick another.</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or description..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Product Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <span className="inline-block animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Package className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <h3 className="text-base font-semibold text-slate-800">No Products Found</h3>
            <p className="text-xs text-slate-500 mt-1">Add your first product to display in the order catalog.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-slate-50/70 ${
                  product.isDefault ? 'bg-amber-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleSetDefault(product.id, product.name)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                      product.isDefault
                        ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                        : 'bg-slate-100 text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                    title={product.isDefault ? 'Currently default product' : 'Click to make default product'}
                  >
                    <Star className={`w-4 h-4 ${product.isDefault ? 'fill-white' : ''}`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                      {product.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          DEFAULT CHOICE
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <div className="text-[11px] text-slate-400 mt-1">ID: {product.id}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-extrabold text-indigo-600">
                      ৳{product.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">Unit Price</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!product.isDefault && (
                      <button
                        onClick={() => handleSetDefault(product.id, product.name)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 transition cursor-pointer"
                        title="Set as Default Product for Resellers"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Bluetooth Earbuds Pro"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price in BDT (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1650"
                  min="0"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Specification <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key specs, warranty, features, color variations..."
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="isDefaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded mt-0.5 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isDefaultCheck" className="text-xs text-slate-800 font-medium cursor-pointer">
                  Set as Default Auto-Selected Product
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Resellers will automatically have this item pre-selected when submitting orders unless they choose a different one.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
