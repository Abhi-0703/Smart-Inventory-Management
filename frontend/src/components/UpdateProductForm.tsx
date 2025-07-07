import React, { useState } from "react";
import { Product } from "@/types/Product";

const UpdateProductForm = ({
  product,
  onUpdated,
}: {
  product: Product;
  onUpdated: () => void;
}) => {
  const [quantity, setQuantity] = useState(product.quantity);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        onUpdated();
      } else {
        console.error("Failed to update quantity");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="mt-2 flex items-center gap-2">
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border px-2 py-1 rounded w-24"
        required
      />
      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
        Update
      </button>
    </form>
  );
};

export default UpdateProductForm;