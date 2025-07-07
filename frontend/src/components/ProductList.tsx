'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useState } from 'react';

type Product = {
  _id: string;
  name: string;
  quantity: number;
  location: string;
};

const fetcher = async (url: string): Promise<Product[]> => {
  const res = await axios.get<Product[]>(url);
  return res.data;
};

export default function ProductList() {
  const { data: products = [], mutate, error } = useSWR<Product[]>(
    'http://localhost:5000/api/products',
    fetcher
  );

  const [transferQty, setTransferQty] = useState<{ [key: string]: number }>({});
  const [targetStore, setTargetStore] = useState<{ [key: string]: string }>({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    location: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchStore, setSearchStore] = useState('');

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTransfer = async (product: Product) => {
    const qty = transferQty[product._id];
    const to = targetStore[product._id];

    if (!qty || !to) {
      showNotification('Please enter quantity and select destination store.', 'error');
      return;
    }

    if (to === product.location) {
      showNotification('Source and destination stores must be different.', 'error');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/transfers', {
        productId: product._id,
        from: product.location,
        to,
        quantity: qty,
      });

      showNotification('Transfer request submitted!', 'success');
      setTransferQty({ ...transferQty, [product._id]: 0 });
      setTargetStore({ ...targetStore, [product._id]: '' });
      mutate();
    } catch (err) {
      showNotification('Error creating transfer request.', 'error');
      console.error(err);
    }
  };

  const handleAddProduct = async () => {
    const { name, quantity, location } = newProduct;

    if (!name || !quantity || !location) {
      showNotification('Please fill all fields.', 'error');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/products', {
        name: name.trim(),
        quantity: Number(quantity),
        location,
      });

      showNotification('Product added!', 'success');
      setNewProduct({ name: '', quantity: '', location: '' });
      mutate();
    } catch (err) {
      showNotification('Error adding product.', 'error');
      console.error(err);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSearchStore('');
  };

  if (error) return <p className="text-red-500">Failed to load products.</p>;

  const sortedProducts = [...products].sort((a, b) => {
    const nameComp = a.name.localeCompare(b.name);
    return nameComp === 0 ? a.location.localeCompare(b.location) : nameComp;
  });

  const filteredProducts = sortedProducts.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = searchStore === '' || p.location === searchStore;
    return matchesName && matchesStore;
  });

  // Unique product names for datalist
  const uniqueProductNames = [...new Set(products.map((p) => p.name))].sort();

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">📋 Inventory Dashboard</h1>

      {/* ✅ Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`px-6 py-3 text-white rounded shadow-lg ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* ✅ Add Product Form */}
      <div className="p-4 mb-6 bg-gray-800 rounded shadow space-y-2">
        <h2 className="text-lg font-semibold text-gray-200">Add New Product</h2>

        <input
          type="text"
          list="existingProducts"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <datalist id="existingProducts">
          {uniqueProductNames.map((name, idx) => (
            <option key={idx} value={name} />
          ))}
        </datalist>

        <input
          type="number"
          placeholder="Quantity"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <select
          value={newProduct.location}
          onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        >
          <option value="">Select Store</option>
          <option value="Store A">Store A</option>
          <option value="Store B">Store B</option>
          <option value="Store C">Store C</option>
        </select>
        <button
          onClick={handleAddProduct}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        >
          Add Product
        </button>
      </div>

      {/* 🔍 Search Form */}
      <div className="p-4 mb-6 bg-gray-800 rounded shadow space-y-2">
        <h2 className="text-lg font-semibold text-gray-200">Search Products</h2>
        <input
          type="text"
          list="productSuggestions"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <datalist id="productSuggestions">
          {uniqueProductNames.map((name, index) => (
            <option key={index} value={name} />
          ))}
        </datalist>

        <select
          value={searchStore}
          onChange={(e) => setSearchStore(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        >
          <option value="">All Stores</option>
          <option value="Store A">Store A</option>
          <option value="Store B">Store B</option>
          <option value="Store C">Store C</option>
        </select>
        <button
          onClick={handleResetSearch}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* ✅ Product Display + Transfer Controls */}
      {filteredProducts.map((product) => (
        <div key={product._id} className="p-4 bg-gray-800 shadow mb-4 rounded">
          <p className="text-gray-200">
            <strong>{product.name}</strong> — {product.quantity} units at {product.location}
          </p>

          <div className="flex flex-col sm:flex-row sm:space-x-2 mt-2 space-y-2 sm:space-y-0">
            <input
              type="number"
              placeholder="Quantity"
              value={transferQty[product._id] || ''}
              onChange={(e) =>
                setTransferQty({ ...transferQty, [product._id]: Number(e.target.value) })
              }
              className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded"
            />

            <select
              value={targetStore[product._id] || ''}
              onChange={(e) =>
                setTargetStore({ ...targetStore, [product._id]: e.target.value })
              }
              className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded"
            >
              <option value="">Select Store</option>
              <option value="Store A">Store A</option>
              <option value="Store B">Store B</option>
              <option value="Store C">Store C</option>
            </select>

            <button
              onClick={() => handleTransfer(product)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Transfer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
