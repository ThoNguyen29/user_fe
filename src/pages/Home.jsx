// src/pages/Home.jsx - Home Page
import React from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import ProductSection from "../components/ProductSection";
import Cart from "../components/Cart";
import { getBackendUrl } from "../utils/pricing";
import { fuzzySearch } from "../utils/search";
import { allProducts as importedProducts } from "../data/products";

function Home() {
  // Use imported products
  const allProducts = React.useMemo(() => importedProducts, []);

  const [filtered, setFiltered] = React.useState(allProducts);

  React.useEffect(() => {
    // expose search handler for Navbar
    window.__APP_ON_SEARCH__ = (query) => {
      const q = (query || '').trim();
      if (!q) { setFiltered(allProducts); return; }

      const qLower = q.toLowerCase();
      const qWords = qLower.split(/\s+/).filter(w => w.length > 0);

      // Try backend search first (silently fail if backend is not available)
      const run = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          
          const res = await fetch(`${getBackendUrl()}/api/drugs/search?q=${encodeURIComponent(q)}&limit=50`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
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
          // Silently fallback to client search if backend is unavailable
          // Don't log errors for 404, timeout, or network issues
          if (e.name !== 'AbortError' && e.name !== 'TypeError' && !e.message?.includes('404')) {
            // Only log unexpected errors
            console.debug('Backend search unavailable, using client-side search');
          }
        }
        
        // Improved client-side search with multiple strategies
        let results = [];

        // Strategy 1: Exact match
        const exactMatches = allProducts.filter(p => {
          const nameLower = p.name.toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          return nameLower === qLower || descLower === qLower;
        });
        results.push(...exactMatches);

        // Strategy 2: Starts with
        const startsWithMatches = allProducts.filter(p => {
          const nameLower = p.name.toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          return (nameLower.startsWith(qLower) || descLower.startsWith(qLower)) &&
                 !exactMatches.includes(p);
        });
        results.push(...startsWithMatches);

        // Strategy 3: Contains all words
        const containsAllWords = allProducts.filter(p => {
          const nameLower = p.name.toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          const combined = `${nameLower} ${descLower}`;
          return qWords.every(word => combined.includes(word)) &&
                 !exactMatches.includes(p) && !startsWithMatches.includes(p);
        });
        results.push(...containsAllWords);

        // Strategy 4: Contains query
        const containsMatches = allProducts.filter(p => {
          const nameLower = p.name.toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          return (nameLower.includes(qLower) || descLower.includes(qLower)) &&
                 !exactMatches.includes(p) && !startsWithMatches.includes(p) && !containsAllWords.includes(p);
        });
        results.push(...containsMatches);

        // Strategy 5: Fuzzy search if needed
        if (results.length < 5) {
          try {
            const fuzzyResults = await fuzzySearch(allProducts, q, ['name', 'description']);
            fuzzyResults.forEach(item => {
              if (!results.find(r => r.id === item.id)) {
                results.push(item);
              }
            });
          } catch {
            // Ignore fuzzy search errors
          }
        }

        // Remove duplicates
        const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
        setFiltered(uniqueResults);
      };
      run();
    };
    return () => { delete window.__APP_ON_SEARCH__; };
  }, [allProducts]);

  return (
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
  );
}

export default Home;

