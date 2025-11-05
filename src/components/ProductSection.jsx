import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard"; // dùng card đẹp
import { getBlockchainContract } from "../../contracts/contract";
import { formatEther } from "ethers";
const ProductSection = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadDrugs = async () => {
      const contract = await getBlockchainContract();
      if (!contract) return;

      const data = await contract.getAllDrugs();
      const [ids, names, batches, prices, stages, owners] = data;

      const formatted = names.map((name, i) => ({
        id: Number(ids[i]),
        name,
        batch: batches[i],
        price: Number(formatEther(prices[i])), // ✅ formatEther trực tiếp
        stage: Number(stages[i]),
        owner: owners[i],
        description: `Batch: ${batches[i]} | Owner: ${owners[i].slice(
          0,
          6
        )}...${owners[i].slice(-4)}`,
        rating: Math.random() * (5 - 3) + 3, // tạo rating ngẫu nhiên
      }));

      setProducts(formatted);
    };

    loadDrugs();
  }, []);

  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
          All Medicines (Blockchain)
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">No medicines found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
