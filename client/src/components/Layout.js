import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  FileText, 
  LogOut,
  Menu,
  X,
  Trophy
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'QR Scanner', href: '/scanner', icon: QrCode },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Access Logs', href: '/logs', icon: FileText },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', href: '/admin', icon: Users }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* Top Navbar */}
      <nav className="glass border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                Gym <span className="gradient-text">Access Control</span>
                {user && (
                  <span className="ml-2 text-sm font-normal text-gray-300">
                    – {user.role === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                )}
              </h1>
            </div>
            
            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`${
                      isCurrentPath(item.href)
                        ? 'text-white bg-red-600/20 px-3 py-2 rounded-md'
                        : 'text-gray-200 hover:text-white hover:bg-gray-800/50 px-3 py-2 rounded-md transition-all duration-300'
                    } flex items-center space-x-2 text-sm font-medium`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-200">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-300 hover:text-white transition-colors duration-300"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full glass">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-4 sm:pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-3 sm:px-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">Gym <span className="gradient-text">Access Control</span></h1>
            </div>
            
            <nav className="mt-4 sm:mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      isCurrentPath(item.href)
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm sm:text-base font-medium rounded-md w-full text-left transition-all duration-300`}
                  >
                    <Icon className="mr-3 sm:mr-4 h-5 w-5 sm:h-6 sm:w-6" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-600 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="ml-2 sm:ml-3">
                <p className="text-sm sm:text-base font-medium text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-300">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-0 sm:pl-3 sm:pt-0">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-10 w-10 sm:h-12 sm:w-12 inline-flex items-center justify-center rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="pt-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
