import React, { useState, useEffect } from 'react';
import { Trophy, User, BarChart3, Bell, Home, Star, Award, TrendingUp } from 'lucide-react';
import Leaderboard from './Leaderboard';
import UserProfile from './UserProfile';
import Statistics from './Statistics';
import Notifications from './Notifications';
import api from '../../services/api';

const GamificationDashboard = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-500' },
    { key: 'profile', label: 'Profile', icon: User, color: 'text-blue-500' },
    { key: 'statistics', label: 'Statistics', icon: BarChart3, color: 'text-green-500' },
    { key: 'notifications', label: 'Notifications', icon: Bell, color: 'text-purple-500' }
  ];

  const fetchUser = async () => {
    try {
      setLoading(true);
      // Get current user from localStorage or context
      const token = localStorage.getItem('token');
      if (token) {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          const response = await api.get(`/api/user/profile/${payload.userId}`);
          setUser(response.data.member);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <UserProfile memberId={user.member_id} />;
      case 'statistics':
        return <Statistics memberId={user.member_id} />;
      case 'notifications':
        return <Notifications memberId={user.member_id} />;
      default:
        return <Leaderboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your gamification dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gym Gamification</h1>
                <p className="text-sm text-gray-500">Compete, achieve, and level up!</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {user.username || `${user.first_name} ${user.last_name}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    Level {user.level} • {user.total_points.toLocaleString()} points
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    user.username?.charAt(0).toUpperCase() || user.first_name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.key ? tab.color : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>

      {/* Quick Stats Footer */}
      {user && (
        <div className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{user.total_points.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{user.current_streak}</div>
                <div className="text-sm text-gray-500">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user.level}</div>
                <div className="text-sm text-gray-500">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">#{user.rank}</div>
                <div className="text-sm text-gray-500">Global Rank</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;
