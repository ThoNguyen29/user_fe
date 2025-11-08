import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard"; // dùng card đẹp
import { getBlockchainContract } from "../../contracts/contract";
import { formatEther } from "ethers";

const ProductSection = ({ title = "All Medicines", products: propsProducts, description }) => {
  const [blockchainProducts, setBlockchainProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Nếu có products từ props (từ search), dùng props
  // Nếu không, load từ blockchain
  const products = propsProducts || blockchainProducts;

  useEffect(() => {
    // Chỉ load từ blockchain nếu không có propsProducts
    if (propsProducts) return;

    const loadDrugs = async () => {
      setLoading(true);
      try {
      const contract = await getBlockchainContract();
        if (!contract) {
          setLoading(false);
          return;
        }

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
          imageUrl: "/api/placeholder/300/200",
      }));

        setBlockchainProducts(formatted);
      } catch (e) {
        console.error('Error loading drugs from blockchain:', e);
      } finally {
        setLoading(false);
      }
    };
 
    loadDrugs();
  }, [propsProducts]);

  return (
  <section className="py-12 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">
            {title}
        </h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
          {propsProducts && propsProducts.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Tìm thấy {propsProducts.length} kết quả
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Đang tải thuốc từ blockchain...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-2">Không tìm thấy thuốc nào.</p>
            <p className="text-sm text-gray-500">Vui lòng thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || Math.random()} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
