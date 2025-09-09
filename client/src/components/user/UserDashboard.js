import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Calendar, 
  Trophy, 
  Bell, 
  LogOut,
  User,
  Clock,
  TrendingUp,
  Award,
  Activity,
  BarChart3,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import QRCodeCard from './QRCodeCard';
import ActivityProgress from './ActivityProgress';
import AttendanceCalendar from './AttendanceCalendar';
import BadgesSection from './BadgesSection';
import NotificationsPanel from './NotificationsPanel';
import Leaderboard from '../gamification/Leaderboard';
import UserProfile from '../gamification/UserProfile';
import Statistics from '../gamification/Statistics';
import Notifications from '../gamification/Notifications';

const UserDashboard = () => {
  const { user, logout } = useUserAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/user/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'qr', name: 'QR Code', icon: QrCode },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'badges', name: 'Badges', icon: Trophy },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'leaderboard', name: 'Leaderboard', icon: Crown },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'statistics', name: 'Statistics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-animated">
      {/* Header */}
      <div className="glass border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg glow-red">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Welcome, <span className="gradient-text">{dashboardData.member.first_name}</span>!
                </h1>
                <p className="text-xs sm:text-sm text-gray-300">Member since {new Date(dashboardData.member.member_since).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 hover:bg-gray-800 px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <nav className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400 bg-gray-800/50'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/30'
                  } whitespace-nowrap py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm flex items-center rounded-t-lg sm:rounded-t-xl transition-all duration-300 flex-shrink-0`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <motion.div 
                className="card card-hover glow-red"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Total Visits</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.stats.total_visits}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card card-hover glow-green"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">This Month</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.stats.this_month_visits}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card card-hover glow-orange"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Current Streak</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.stats.current_streak} days</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card card-hover glow-red"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Badges Earned</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.badges.length}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gamification Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <motion.div 
                className="card card-hover glow-purple"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Total Points</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.member.total_points?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card card-hover glow-yellow"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Level</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.member.level || 1}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card card-hover glow-blue"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Global Rank</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">#{dashboardData.member.rank || 'N/A'}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card card-hover glow-green"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-300">Experience</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{dashboardData.member.experience?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Activity Progress */}
            <ActivityProgress 
              activityPercentage={dashboardData.stats.activity_percentage}
              thisMonthVisits={dashboardData.stats.this_month_visits}
            />

            {/* Membership Info */}
            {dashboardData.membership && (
              <motion.div 
                className="card card-hover glow-red"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  Membership Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-300 mb-2">Type</p>
                    <p className="text-lg font-semibold text-white">{dashboardData.membership.type}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-300 mb-2">Expires</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(dashboardData.membership.expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-300 mb-2">Days Remaining</p>
                    <p className={`text-lg font-semibold ${
                      dashboardData.membership.days_until_expiration <= 3 
                        ? 'text-red-400' 
                        : dashboardData.membership.days_until_expiration <= 7 
                        ? 'text-orange-400' 
                        : 'text-green-400'
                    }`}>
                      {dashboardData.membership.days_until_expiration} days
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Badges */}
            {dashboardData.badges.length > 0 && (
              <motion.div 
                className="card card-hover glow-orange"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  Recent Badges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.badges.slice(0, 3).map((badge, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:border-orange-500 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-3xl mr-4">{badge.icon_url}</span>
                      <div>
                        <p className="font-semibold text-white">{badge.name}</p>
                        <p className="text-sm text-gray-300">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'qr' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QRCodeCard qrCode={dashboardData.member.qr_code} />
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AttendanceCalendar />
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BadgesSection badges={dashboardData.badges} />
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NotificationsPanel 
              notifications={dashboardData.notifications}
              onMarkAsRead={fetchDashboardData}
            />
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Leaderboard />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UserProfile memberId={user?.memberId} />
          </motion.div>
        )}

        {activeTab === 'statistics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Statistics memberId={user?.memberId} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
