'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useState, useEffect } from 'react';

type Recommendation = {
  product: string;
  from: string;
  to: string;
  suggestedAmount: number;
};

type Warning = {
  product: string;
  store: string;
  issue: string;
};

type RecommendationResponse = {
  recommendations: Recommendation[];
  warnings: Warning[];
};

const fetcher = async (url: string): Promise<RecommendationResponse> => {
  const res = await axios.get<RecommendationResponse>(url);
  return res.data;
};

export default function RecommendationPage() {
  const {
    data,
    error,
    isLoading,
  } = useSWR<RecommendationResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recommendations`,
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  const [searchProduct, setSearchProduct] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [storeOptions, setStoreOptions] = useState<string[]>([]);

  useEffect(() => {
    if (data?.recommendations) {
      const uniqueProducts = Array.from(new Set(data.recommendations.map(r => r.product)));
      const uniqueStores = Array.from(
        new Set(data.recommendations.flatMap(r => [r.from, r.to]))
      );
      setProductOptions(uniqueProducts);
      setStoreOptions(uniqueStores);
    }
  }, [data]);

  const filteredRecommendations = (data?.recommendations || []).filter((rec) => {
    const productMatch = rec.product.toLowerCase().includes(searchProduct.toLowerCase());
    const fromMatch = rec.from.toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = rec.to.toLowerCase().includes(searchTo.toLowerCase());
    return productMatch && fromMatch && toMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Stock Transfer Recommendations</h1>

      {/* 🔍 Filters */}
      <div className="mb-6 bg-gray-800 p-4 rounded border border-gray-600 space-y-2">
        <input
          type="text"
          list="product-options"
          placeholder="Search by Product"
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <datalist id="product-options">
          {productOptions.map((product, index) => (
            <option key={index} value={product} />
          ))}
        </datalist>

        <input
          type="text"
          list="store-from-options"
          placeholder="Search by From Store"
          value={searchFrom}
          onChange={(e) => setSearchFrom(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <datalist id="store-from-options">
          {storeOptions.map((store, index) => (
            <option key={index} value={store} />
          ))}
        </datalist>

        <input
          type="text"
          list="store-to-options"
          placeholder="Search by To Store"
          value={searchTo}
          onChange={(e) => setSearchTo(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 px-2 py-1 rounded w-full"
        />
        <datalist id="store-to-options">
          {storeOptions.map((store, index) => (
            <option key={index} value={store} />
          ))}
        </datalist>

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

      {/* 🧠 Recommendations */}
      {isLoading && <p className="text-gray-400">Loading recommendations...</p>}
      {error && <p className="text-red-500">Error loading recommendations.</p>}

      {filteredRecommendations.length === 0 && !isLoading && !error ? (
        <p className="text-gray-400">No recommendations to display.</p>
      ) : (
        <ul className="space-y-4">
          {filteredRecommendations.map((rec, index) => (
            <li
              key={index}
              className="p-4 rounded border border-gray-600 bg-gray-800 whitespace-pre-line"
            >
              {`Product: ${rec.product}
From: ${rec.from}
To: ${rec.to}
Suggested Amount: ${rec.suggestedAmount}`}
            </li>
          ))}
        </ul>
      )}

      {/* ⚠️ Warnings */}
      {data?.warnings && data.warnings.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2 text-yellow-300">⚠️ Warnings</h2>
          <ul className="space-y-2">
            {data.warnings.map((warn, index) => (
              <li
                key={index}
                className="p-3 rounded border border-yellow-600 bg-yellow-900 text-yellow-100"
              >
                <div>
                  <p><strong>Product:</strong> {warn.product}</p>
                  <p><strong>Store:</strong> {warn.store}</p>
                  <p><strong>Issue:</strong> {warn.issue}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
/*code ends here*/
