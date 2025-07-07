import { useState } from "react";
import Head from "next/head";
import ProductList from "@/components/ProductList";

export default function Home() {
  const [launched, setLaunched] = useState(false);

  if (!launched) {
    return (
      <>
        <Head>
          <title>Smart Inventory System</title>
        </Head>
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
          <h1 className="text-4xl font-extrabold mb-4 text-center">
            📦 Smart Inventory Redistribution System
          </h1>
          <p className="text-lg mb-8 text-center max-w-2xl">
            A smart solution to optimize inventory transfers between stores based on real-time stock and demand levels.
          </p>
          <button
            onClick={() => setLaunched(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg text-lg transition duration-200"
          >
            🚀 Launch Dashboard
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Inventory Dashboard</title>
      </Head>
      <main className="min-h-screen bg-black text-white p-4">
        <ProductList />
      </main>
    </>
  );
}
