// src/components/Banner.jsx - Frontend Only Version
import React from 'react';

const Banner = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url(data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E)]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 fade-in">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Propharm
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto fade-in">
            Your trusted partner in healthcare and wellness. Discover premium quality pharmaceutical products and supplements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in">
            <button 
              onClick={() => alert('Shop Now feature (Frontend-Only Demo)')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Shop Now
            </button>
            
            <button 
              onClick={() => alert('Learn More feature (Frontend-Only Demo)')}
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </button>
          </div>
          
          
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/10 rounded-full blur-lg"></div>
    </section>
  );
};

export default Banner;

