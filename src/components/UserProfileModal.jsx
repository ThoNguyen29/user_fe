import React from 'react';
import UserProfile from '../pages/UserProfile';

const UserProfileModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Full screen content with back button */}
      <UserProfile onBack={onClose} />
    </div>
  );
};

export default UserProfileModal;
