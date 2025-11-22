// src/pages/ProductDetail.jsx - Product Detail Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiArrowLeft, FiCheck, FiPackage, FiShield, FiTruck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import { useCart } from '../contexts/CartContext';
import { getBackendUrl } from '../utils/pricing';
import { allProducts as sampleProducts } from '../data/products';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Try to fetch from blockchain first, then backend, then fallback to sample data
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Try blockchain first
        const { getBlockchainContract } = await import('../../contracts/contract');
        const { ethers, formatEther } = await import('ethers');
        
        const contract = await getBlockchainContract();
        if (contract) {
          const data = await contract.getAllDrugs();
          const [ids, names, batches, prices, stages, owners] = data;
          
          // Find product by id
          const index = ids.findIndex(drugId => Number(drugId) === parseInt(id));
          if (index !== -1) {
            setProduct({
              id: Number(ids[index]),
              name: names[index],
              price: Number(formatEther(prices[index])),
              imageUrl: "/api/placeholder/300/200",
              rating: 4.5,
              description: `Batch ${batches[index]}`,
              batch: batches[index],
              owner: owners[index],
              fullDescription: `Sản phẩm từ blockchain với batch ${batches[index]}. Owner: ${owners[index]}`,
              ingredients: "N/A",
              dosage: "Consult healthcare provider",
              warnings: "Consult healthcare provider before use",
              manufacturer: "Blockchain Verified",
              expiryDate: "N/A",
              stock: 999,
            });
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.debug('Blockchain not available, trying backend');
      }

      try {
        // Try backend
        const res = await fetch(`${getBackendUrl()}/api/drugs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct({
            id: data.id,
            name: data.name,
            price: 0,
            imageUrl: "/api/placeholder/300/200",
            rating: 4.5,
            description: data.description || `Batch ${data.batch}`,
            batch: data.batch,
            owner: data.owner,
            fullDescription: data.description || "No detailed description available.",
            ingredients: "N/A",
            dosage: "Consult healthcare provider",
            warnings: "Consult healthcare provider before use",
            manufacturer: "N/A",
            expiryDate: "N/A",
            stock: data.quantity || 0,
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.debug('Backend not available, using sample data');
      }

      // Fallback to sample data
      const foundProduct = sampleProducts.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Product Detail - Simplified */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <p className="text-gray-600">Batch {product.batch}</p>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-bold text-blue-600">
                    {product.manufacturer === 'Blockchain Verified' ? `${product.price} ETH` : `$${product.price}`}
                  </span>
                  <span className="text-gray-500 text-lg">/ đơn vị</span>
                </div>
              </div>

              {/* Batch Information */}
              <div className="bg-blue-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Thông tin lô hàng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <span className="text-gray-600">Lô sản xuất:</span>
                    <span className="font-semibold text-gray-900">{product.batch}</span>
                  </div>
                  {product.owner && (
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-mono text-sm bg-white px-3 py-1 rounded-lg text-gray-700 border border-gray-200">
                        {product.owner.slice(0, 6)}...{product.owner.slice(-4)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Số lượng còn:</span>
                    <span className="font-semibold text-green-600">{product.stock} đơn vị</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-900">Số lượng</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-xl font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    -
                  </button>
                  <span className="text-3xl font-bold text-gray-900 w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-xl font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isAdded
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                }`}
              >
                {isAdded ? (
                  <>
                    <FiCheck className="w-6 h-6" />
                    <span>Đã thêm vào giỏ!</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-6 h-6" />
                    <span>Thêm vào giỏ hàng</span>
                  </>
                )}
              </button>
            </div>
          </div>

          
        </div>
      </div>

      {/* Cart Component */}
      <Cart />
    </div>
  );
};

export default ProductDetail;



