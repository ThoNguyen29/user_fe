// src/components/Cart.jsx
import React, { useState } from 'react';
import { FiX, FiPlus, FiMinus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWeb3 } from '../contexts/Web3Context';
import PaymentModal from './PaymentModal';

const Cart = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
    clearCart
  } = useCart();

  const { isConnected } = useWeb3();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleCheckout = () => {
    if (!isConnected) {
      alert('Please connect your MetaMask wallet to proceed with payment');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    clearCart();
    setShowPaymentModal(false);
    closeCart();
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-white/40 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex items-center space-x-2">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Shopping Cart ({getTotalItems()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm text-center">
                  Add some products to get started with your blockchain-powered purchase
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ring-1 ring-blue-100">
                      <div className="w-8 h-8 bg-blue-500/90 rounded-lg" />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">${item.price} each</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95 transition"
                      >
                        <FiMinus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95 transition"
                      >
                        <FiPlus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    
                    {/* Line total + Remove */}
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-semibold text-gray-900 min-w-[70px] text-right">${(item.price * item.quantity).toFixed(2)}</div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition"
                        aria-label="Remove"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-6 space-y-4 sticky bottom-0 bg-white">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-blue-600">${getTotalPrice().toFixed(2)}</span>
              </div>
              
              {/* Blockchain Notice */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Payment will be processed on blockchain</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  isConnected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isConnected}
              >
                {isConnected ? 'Pay with MetaMask' : 'Connect Wallet to Pay'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          cartItems={cartItems}
          totalPrice={getTotalPrice()}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default Cart;
