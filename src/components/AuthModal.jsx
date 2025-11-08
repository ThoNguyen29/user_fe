import React from 'react';
import LoginRegister from '../pages/LoginRegister';
import { FiX } from 'react-icons/fi';

const AuthModal = ({ onClose }) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 mx-4 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close auth modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="mt-2">
          <LoginRegister onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
