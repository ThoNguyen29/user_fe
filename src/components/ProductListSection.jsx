// src/components/ProductListSection.jsx - Component to display product list
import React from 'react';
import ProductCard from './ProductCard';

const ProductListSection = ({ title, products, description, loading }) => {
  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Tìm thấy <span className="font-semibold text-blue-600">{products.length}</span> kết quả
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductListSection;

