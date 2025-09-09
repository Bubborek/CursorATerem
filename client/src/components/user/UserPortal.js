import React, { useState } from 'react';
import { UserAuthProvider, useUserAuth } from '../../contexts/UserAuthContext';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';
import UserDashboard from './UserDashboard';

const UserPortalContent = () => {
  const { isAuthenticated, loading } = useUserAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <UserDashboard />;
  }

  if (showRegister) {
    return <UserRegister onBackToLogin={() => setShowRegister(false)} />;
  }

  return <UserLogin onShowRegister={() => setShowRegister(true)} />;
};

const UserPortal = () => {
  return (
    <UserAuthProvider>
      <UserPortalContent />
    </UserAuthProvider>
  );
};

export default UserPortal;
