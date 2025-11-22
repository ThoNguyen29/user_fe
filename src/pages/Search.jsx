// src/pages/Search.jsx - Search Page for Medicines
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiX, FiSliders } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import ProductListSection from '../components/ProductListSection';
import { getBackendUrl } from '../utils/pricing';
import { fuzzySearch } from '../utils/search';

// Sample products data (same as Home.jsx)
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

const allProducts = [...fluProducts, ...coughProducts, ...vitaminProducts];

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance'); // relevance, price-asc, price-desc, rating
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

  // Debounce search
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Improved search function with better accuracy
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setRawResults([]);
      return;
    }

    setLoading(true);
    const q = query.trim();
    const qLower = q.toLowerCase();
    const qWords = qLower.split(/\s+/).filter(w => w.length > 0);

    try {
      // Try backend search first (silently fail if backend is not available)
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
            const mapped = data.items.map(d => ({
              id: Number(d.id) || d.id,
              name: d.name,
              price: 0,
              imageUrl: "/api/placeholder/300/200",
              rating: 4.5,
              description: `Batch ${d.batch} • Owner ${d.owner.slice(0,6)}...${d.owner.slice(-4)}`,
            }));
            setRawResults(mapped);
            setLoading(false);
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

      // Client-side search with multiple strategies
      let results = [];

      // Strategy 1: Exact match (case-insensitive)
      const exactMatches = allProducts.filter(p => {
        const nameLower = p.name.toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        return nameLower === qLower || descLower === qLower;
      });
      results.push(...exactMatches);

      // Strategy 2: Starts with match
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

      // Strategy 4: Contains query (simple substring)
      const containsMatches = allProducts.filter(p => {
        const nameLower = p.name.toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        return (nameLower.includes(qLower) || descLower.includes(qLower)) &&
               !exactMatches.includes(p) && !startsWithMatches.includes(p) && !containsAllWords.includes(p);
      });
      results.push(...containsMatches);

      // Strategy 5: Fuzzy search (if still not enough results)
      if (results.length < 5) {
        try {
          const fuzzyResults = await fuzzySearch(allProducts, q, ['name', 'description']);
          // Add fuzzy results that aren't already in results
          fuzzyResults.forEach(item => {
            if (!results.find(r => r.id === item.id)) {
              results.push(item);
            }
          });
        } catch (e) {
          // Ignore fuzzy search errors
        }
      }

      // Remove duplicates
      const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
      setRawResults(uniqueResults);
    } catch (error) {
      console.error('Search error:', error);
      setRawResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      performSearch(query);
    }, 300),
    [performSearch]
  );

  // Perform search when URL query parameter changes
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam);
    } else {
      setSearchQuery('');
      setRawResults([]);
    }
  }, [queryParam, performSearch]);

  // Sort and filter results
  useEffect(() => {
    if (rawResults.length === 0) {
      setResults([]);
      return;
    }

    let sorted = [...rawResults];

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // relevance - keep original order
        break;
    }

    // Filter by price range
    sorted = sorted.filter(p => {
      const price = p.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    setResults(sorted);
  }, [rawResults, sortBy, priceRange]);

  const handleClear = () => {
    setSearchQuery('');
    setRawResults([]);
    setSearchParams({}, { replace: true });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <main className="fade-in">
        {/* Search Header - Simplified */}
        {searchQuery && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-white text-center">
                Kết quả tìm kiếm cho "{searchQuery}"
              </h1>
              
              {/* Filter Toggle */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <FiSliders className="h-5 w-5" />
                  <span>Bộ lọc</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp theo
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Liên quan nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá: ${priceRange.min} - ${priceRange.max}
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <ProductListSection
          title={null}
          products={results}
          description={searchQuery ? null : "Nhập từ khóa vào thanh tìm kiếm ở trên để tìm thuốc"}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default Search;

