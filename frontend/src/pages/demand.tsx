'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useState, useEffect } from 'react';

type Demand = {
  _id: string;
  productId: string;
  productName: string;
  store: string;
  level: number;
};

type Product = {
  _id: string;
  name: string;
};

const levelMap: Record<number, string> = {
  0: 'low',
  1: 'medium',
  2: 'high',
};

const levelReverseMap: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await axios.get<T>(url);
  return res.data;
};

export default function DemandManager() {
  const {
    data: demands = [],
    mutate: mutateDemands,
    isLoading: loadingDemands,
    error: errorDemands,
  } = useSWR<Demand[]>('http://localhost:5000/api/demands', fetcher, {
    refreshInterval: 10000,
  });

  const {
    data: products = [],
    isLoading: loadingProducts,
    error: errorProducts,
  } = useSWR<Product[]>('http://localhost:5000/api/products', fetcher);

  const [form, setForm] = useState({
    productName: '',
    store: '',
    level: 1,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchStore, setSearchStore] = useState('');
  const [productNames, setProductNames] = useState<string[]>([]);

  useEffect(() => {
    const allNames = Array.from(new Set(products.map((p) => p.name)));
    setProductNames(allNames);
  }, [products]);

  const updateDemand = async (id: string, newLevel: number) => {
    try {
      await axios.put(`http://localhost:5000/api/demands/${id}`, { level: newLevel });
      mutateDemands();
    } catch (err) {
      console.error('Failed to update demand', err);
    }
  };

  const createDemand = async () => {
    const matchedProduct = products.find((p) => p.name === form.productName);
    if (!matchedProduct) {
      alert('Invalid product name');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/demands', {
        productId: matchedProduct._id,
        store: form.store,
        level: form.level,
      });
      setForm({ productName: '', store: '', level: 1 });
      mutateDemands();
    } catch (err) {
      console.error('Failed to create demand', err);
    }
  };

  const filteredDemands = demands.filter(
    (d) =>
      d.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (searchStore ? d.store === searchStore : true)
  );

  if (loadingDemands || loadingProducts) {
    return <p className="text-white p-6">Loading data...</p>;
  }

  if (errorDemands || errorProducts) {
    return <p className="text-red-500 p-6">Error loading data.</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">📊 Demand Manager</h1>

      {/* ➕ Add Demand Form */}
      <div className="p-4 bg-gray-800 rounded mb-6 border border-gray-600">
        <h2 className="text-lg font-semibold mb-2">Add Demand</h2>
        <div className="flex flex-col gap-2">
          {/* 🔽 Searchable Product Dropdown */}
          <input
            type="text"
            list="product-list"
            placeholder="Product name"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            className="border border-gray-600 bg-black text-white px-2 py-1 rounded"
          />
          <datalist id="product-list">
            {productNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          {/* Store Dropdown */}
          <select
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
            className="border border-gray-600 bg-black text-white px-2 py-1 rounded"
          >
            <option value="">Select Store</option>
            <option value="Store A">Store A</option>
            <option value="Store B">Store B</option>
            <option value="Store C">Store C</option>
          </select>

          {/* Demand Level Dropdown */}
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
            className="border border-gray-600 bg-black text-white px-2 py-1 rounded"
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>

          <button
            onClick={createDemand}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ➕ Add Demand
          </button>
        </div>
      </div>

      {/* 🔍 Search Filters */}
      <div className="p-4 bg-gray-800 rounded mb-6 border border-gray-600">
        <h2 className="text-lg font-semibold mb-2">Search Existing Demands</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {/* Product Search with Datalist */}
          <div className="relative w-full">
            <input
              type="text"
              list="product-names"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black text-white border border-gray-600 px-3 py-1 rounded w-full"
            />
            <datalist id="product-names">
              {productNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          {/* Store Filter */}
          <select
            value={searchStore}
            onChange={(e) => setSearchStore(e.target.value)}
            className="bg-black text-white border border-gray-600 px-3 py-1 rounded"
          >
            <option value="">All Stores</option>
            <option value="Store A">Store A</option>
            <option value="Store B">Store B</option>
            <option value="Store C">Store C</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchStore('');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 📋 Demand List */}
      {filteredDemands.length === 0 ? (
        <p>No demand data found.</p>
      ) : (
        filteredDemands.map((demand) => (
          <div
            key={demand._id}
            className="p-4 bg-gray-800 text-white rounded shadow mb-4 border border-gray-600"
          >
            <p>
              <strong>{demand.productName}</strong> — {demand.store}
            </p>
            <select
              value={levelMap[demand.level]}
              onChange={(e) => updateDemand(demand._id, levelReverseMap[e.target.value])}
              className="mt-2 border border-gray-600 bg-black text-white px-2 py-1 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}
