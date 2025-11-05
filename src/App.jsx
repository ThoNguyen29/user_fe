// src/App.jsx - Blockchain Integrated Version
import React from "react";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import ProductSection from "./components/ProductSection";
import Cart from "./components/Cart";
import { Web3Provider } from "./contexts/Web3Context";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { getBackendUrl } from "./utils/pricing";
import { fuzzySearch } from "./utils/search";

// Dữ liệu mẫu cho Frontend-Only Version
const fluProducts = [
  {
    id: 1,
    name: "Dextromethorphan 10mg",
    price: 12.9,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.5,
    description: "Effective cough suppressant for dry cough relief",
  },
  {
    id: 2,
    name: "Coldacmin",
    price: 8.98,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.2,
    description: "Multi-symptom cold relief medication",
  },
  {
    id: 3,
    name: "Decolgen",
    price: 3.32,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.0,
    description: "Fast-acting decongestant for nasal congestion",
  },
  {
    id: 4,
    name: "Paracetamol 500mg",
    price: 24.78,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.8,
    description: "Pain relief and fever reducer",
  },
];

const coughProducts = [
  {
    id: 5,
    name: "Cidetuss",
    price: 2.0,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.1,
    description: "Natural cough syrup with honey",
  },
  {
    id: 6,
    name: "Methorphan",
    price: 1.99,
    imageUrl: "/api/placeholder/300/200",
    rating: 3.9,
    description: "Cough suppressant for persistent cough",
  },
  {
    id: 7,
    name: "Bisolvon",
    price: 0.89,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.3,
    description: "Expectorant for productive cough",
  },
  {
    id: 8,
    name: "Clorpheniramin",
    price: 4.0,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.0,
    description: "Antihistamine for allergy relief",
  },
];

const vitaminProducts = [
  {
    id: 9,
    name: "Vitamin C 1000mg",
    price: 15.5,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.6,
    description: "Immune system support and antioxidant",
  },
  {
    id: 10,
    name: "Vitamin D3",
    price: 18.75,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.4,
    description: "Bone health and immune function",
  },
  {
    id: 11,
    name: "Multivitamin Complex",
    price: 22.99,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.7,
    description: "Complete daily vitamin supplement",
  },
  {
    id: 12,
    name: "Omega-3 Fish Oil",
    price: 28.5,
    imageUrl: "/api/placeholder/300/200",
    rating: 4.5,
    description: "Heart and brain health support",
  },
];

function App() {
  // Combine and de-duplicate products by id
  const allProducts = React.useMemo(() => {
    const map = new Map();
    [...fluProducts, ...coughProducts, ...vitaminProducts].forEach(p => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, []);

  const [filtered, setFiltered] = React.useState(allProducts);

  React.useEffect(() => {
    // expose search handler for Navbar
    window.__APP_ON_SEARCH__ = (query) => {
      const q = (query || '').toLowerCase().trim();
      if (!q) { setFiltered(allProducts); return; }

      // Try backend search first
      const run = async () => {
        try {
          const res = await fetch(`${getBackendUrl()}/api/drugs/search?q=${encodeURIComponent(q)}&limit=50`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items) && data.items.length) {
              // Map backend drug to frontend product shape; price unknown -> 0
              const mapped = data.items.map(d => ({
                id: Number(d.id) || d.id,
                name: d.name,
                price: 0,
                imageUrl: "/api/placeholder/300/200",
                rating: 4.5,
                description: `Batch ${d.batch} • Owner ${d.owner.slice(0,6)}...${d.owner.slice(-4)}`,
              }));
              setFiltered(mapped);
              return;
            }
          }
        } catch (e) {
          // ignore and fallback
        }
        // Fallback: client fuzzy search with Fuse.js
        try {
          const res = await fuzzySearch(allProducts, q, ['name', 'description']);
          setFiltered(res);
        } catch {
          // Final naive fallback
          setFiltered(
            allProducts.filter(p =>
              p.name.toLowerCase().includes(q) ||
              (p.description || '').toLowerCase().includes(q)
            )
          );
        }
      };
      run();
    };
    return () => { delete window.__APP_ON_SEARCH__; };
  }, [allProducts]);

  return (
    <AuthProvider>
      <Web3Provider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <Navbar />

            <main className="fade-in">
              <Banner />

            {/* All Medicines (deduplicated) */}
            <ProductSection
              title="All Medicines"
              products={filtered}
              description="Browse our complete catalog"
            />
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
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
