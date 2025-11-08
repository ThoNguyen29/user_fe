// src/App.jsx - Blockchain Integrated Version
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import ProductSection from "./components/ProductSection";
import Cart from "./components/Cart";
import { Web3Provider } from "./contexts/Web3Context";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { TransactionProvider } from "./contexts/TransactionContext";
import { getBackendUrl } from "./utils/pricing";
import { formatEther } from "ethers";

function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load drugs from Blockchainadmin backend
  useEffect(() => {
    const loadDrugs = async () => {
      setLoading(true);
      try {
        // Lấy backend URL từ Blockchainadmin
        const blockchainAdminUrl = getBackendUrl(); // Có thể cần config riêng cho Blockchainadmin
        
        // Thử lấy từ endpoint /drugs (cần auth) hoặc /api/drugs/search (public)
        // Dùng /api/drugs/search với query rỗng để lấy tất cả
        const res = await fetch(`${blockchainAdminUrl}/api/drugs/search?q=&limit=100`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            // Map backend drug format to frontend product format
            const mapped = data.items.map((drug) => ({
              id: drug.id || Math.random().toString(36).substr(2, 9),
              name: drug.name || 'Unknown',
              price: drug.price ? Number(formatEther(drug.price)) : 0,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.5,
              description: drug.batch ? `Batch: ${drug.batch}` : 'No description',
              batch: drug.batch,
              owner: drug.owner,
              stage: drug.stage,
            }));
            setAllProducts(mapped);
            setFiltered(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error loading drugs from Blockchainadmin backend:', e);
      }
      
      // Nếu không load được, để danh sách rỗng
      setAllProducts([]);
      setFiltered([]);
      setLoading(false);
    };

    loadDrugs();
  }, []);

  // Search handler - chỉ dùng backend Blockchainadmin
  useEffect(() => {
    // expose search handler for Navbar
    window.__APP_ON_SEARCH__ = (query) => {
      const q = (query || '').trim();
      
      // Nếu query rỗng, hiển thị tất cả
      if (!q) {
        setFiltered(allProducts);
        return;
      }

      // Search từ backend Blockchainadmin
      const run = async () => {
        try {
          const blockchainAdminUrl = getBackendUrl();
          const res = await fetch(`${blockchainAdminUrl}/api/drugs/search?q=${encodeURIComponent(q)}&limit=100`);
          
          if (res.ok) {
            const data = await res.json();
            if (data.items && Array.isArray(data.items)) {
              // Map backend drug format to frontend product format
              const mapped = data.items.map((drug) => ({
                id: drug.id || Math.random().toString(36).substr(2, 9),
                name: drug.name || 'Unknown',
                price: drug.price ? Number(formatEther(drug.price)) : 0,
                imageUrl: "/api/placeholder/300/200",
                rating: 4.5,
                description: drug.batch ? `Batch: ${drug.batch}` : 'No description',
                batch: drug.batch,
                owner: drug.owner,
                stage: drug.stage,
              }));
              setFiltered(mapped);
              return;
            }
          }
        } catch (e) {
          console.error('Backend search failed:', e);
          // Nếu search thất bại, hiển thị danh sách rỗng
          setFiltered([]);
        }
      };
      run();
    };
    
    return () => { delete window.__APP_ON_SEARCH__; };
  }, [allProducts]);

  return (
    <AuthProvider>
      <Web3Provider>
        <TransactionProvider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <Navbar />

            <main className="fade-in">
              <Banner />

            {/* All Medicines from Blockchainadmin */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Đang tải thuốc từ backend...</p>
              </div>
            ) : (
            <ProductSection
                title={filtered.length === allProducts.length ? "All Medicines" : `Kết quả tìm kiếm (${filtered.length})`}
              products={filtered}
                description={filtered.length === allProducts.length ? "Danh sách thuốc từ Blockchainadmin" : "Kết quả tìm kiếm thuốc"}
            />
            )}
            </main>

            {/* Cart Component */}
            <Cart />

            {/* Footer */}
            <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold">Propharm</span>
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Your trusted partner in healthcare and wellness. We provide
                    premium quality pharmaceutical products and supplements.
                  </p>
                  <div className="text-xs text-blue-200 bg-blue-800/30 px-3 py-2 rounded-lg">
                    🔗 Blockchain Integrated - MetaMask Payment Ready
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Products
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Support
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Categories</h3>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Flu Medicine
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Cough Medicine
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Vitamins
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Supplements
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Info</h3>
                  <div className="space-y-2 text-sm text-blue-100">
                    <p>📧 info@propharm.com</p>
                    <p>📞 +1 (555) 123-4567</p>
                    <p>📍 123 Health Street, Medical City</p>
                    <div className="mt-3 p-2 bg-green-800/30 rounded-lg text-xs">
                      ✅ Blockchain Ready - MetaMask Integration
                    </div>
                  </div>
                </div>
                </div>

                <div className="border-t border-blue-700 mt-12 pt-8 text-center text-sm text-blue-200">
                  <p>
                    &copy; 2024 Propharm. All rights reserved. | Privacy Policy |
                    Terms of Service
                  </p>
                  <p className="mt-2 text-xs">
                    Blockchain Integrated Version - MetaMask Payment Ready
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
        </TransactionProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
