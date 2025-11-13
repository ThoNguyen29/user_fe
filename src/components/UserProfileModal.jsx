import React from 'react';
import { FiX, FiUser } from 'react-icons/fi';
import UserProfile from '../pages/UserProfile';

const UserProfileModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FiUser className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold">Thông tin người dùng</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX /></button>
        </div>
        <div className="p-4">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;


