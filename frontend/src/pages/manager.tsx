'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useState, useEffect } from 'react';

type Product = {
  _id: string;
  name: string;
  quantity: number;
  location: string;
};

type TransferRequest = {
  _id: string;
  productId: Product;
  from: string;
  to: string;
  quantity: number;
  status: string;
};

const fetcher = async (url: string): Promise<TransferRequest[]> => {
  const response = await axios.get<TransferRequest[]>(url);
  return response.data;
};

export default function ManagerPanel() {
  const {
    data: requests,
    error,
    isLoading,
    mutate,
  } = useSWR<TransferRequest[]>('http://localhost:5000/api/transfers', fetcher, {
    refreshInterval: 10000,
  });

  const [searchProduct, setSearchProduct] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [productOptions, setProductOptions] = useState<string[]>([]);

  // 🔄 Extract unique product names for dropdown
  useEffect(() => {
    if (requests) {
      const uniqueNames = Array.from(new Set(requests.map(r => r.productId.name)));
      setProductOptions(uniqueNames);
    }
  }, [requests]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/transfers/${id}`, { status });
      mutate(); // Refresh after update
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  if (isLoading) {
    return <p className="text-white p-6">Loading transfer requests...</p>;
  }

  if (error) {
    return <p className="text-red-500 p-6">Failed to load transfer requests.</p>;
  }

  // Filter requests based on search fields
  const filteredRequests = (requests ?? []).filter((req) => {
    const productMatch = req.productId.name.toLowerCase().includes(searchProduct.toLowerCase());
    const fromMatch = req.from.toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = req.to.toLowerCase().includes(searchTo.toLowerCase());
    return productMatch && fromMatch && toMatch;
  });

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">💼 Manager Approval Panel</h1>

      {/* 🔍 Search Filters */}
      <div className="mb-6 bg-gray-800 p-4 rounded border border-gray-600 space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Product"
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
            list="product-options"
          />
          <datalist id="product-options">
            {productOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <input
          type="text"
          placeholder="Search by From Store"
          value={searchFrom}
          onChange={(e) => setSearchFrom(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          placeholder="Search by To Store"
          value={searchTo}
          onChange={(e) => setSearchTo(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />

        <button
          onClick={() => {
            setSearchProduct('');
            setSearchFrom('');
            setSearchTo('');
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* 📦 Transfer Requests */}
      {filteredRequests.length === 0 ? (
        <p>No matching transfer requests.</p>
      ) : (
        [...filteredRequests].reverse().map((req) => (
          <div
            key={req._id}
            className="mb-4 p-4 rounded border border-gray-600 bg-gray-800"
          >
            <p><strong>Product:</strong> {req.productId.name}</p>
            <p><strong>From:</strong> {req.from}</p>
            <p><strong>To:</strong> {req.to}</p>
            <p><strong>Quantity:</strong> {req.quantity}</p>
            <p><strong>Status:</strong> <span className="capitalize">{req.status}</span></p>

            {req.status === 'pending' && (
              <div className="mt-3 space-x-4">
                <button
                  onClick={() => updateStatus(req._id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => updateStatus(req._id, 'rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
