import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Zap, Award, Trophy, Star, Activity, Crown } from 'lucide-react';
import api from '../../services/api';

const Statistics = ({ memberId }) => {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, profileResponse] = await Promise.all([
        api.get(`/api/user/stats/${memberId}`),
        api.get(`/api/user/profile/${memberId}`)
      ]);
      
      setStats(statsResponse.data);
      setProfile(profileResponse.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchStats();
    }
  }, [memberId, timeRange]);

  const getPerformanceLevel = (visits) => {
    if (visits >= 20) return { level: 'Elite', color: 'text-purple-600', icon: Crown };
    if (visits >= 15) return { level: 'Advanced', color: 'text-blue-600', icon: Star };
    if (visits >= 10) return { level: 'Intermediate', color: 'text-green-600', icon: Target };
    if (visits >= 5) return { level: 'Beginner', color: 'text-yellow-600', icon: TrendingUp };
    return { level: 'Getting Started', color: 'text-gray-600', icon: Activity };
  };

  const getStreakStatus = (streak) => {
    if (streak >= 30) return { status: 'On Fire!', color: 'text-red-600', emoji: '🔥' };
    if (streak >= 14) return { status: 'Consistent', color: 'text-orange-600', emoji: '⚡' };
    if (streak >= 7) return { status: 'Building', color: 'text-yellow-600', emoji: '📈' };
    if (streak >= 3) return { status: 'Starting', color: 'text-green-600', emoji: '🌱' };
    return { status: 'New', color: 'text-gray-600', emoji: '🆕' };
  };

  const calculateWeeklyGoal = () => {
    // Assume goal is 5 visits per week
    const goal = 5;
    const progress = Math.min(100, (stats?.weekly_visits / goal) * 100);
    return { goal, progress };
  };

  const getRankTier = (rank) => {
    if (rank <= 3) return { tier: 'Champion', color: 'from-yellow-400 to-orange-500', icon: Trophy };
    if (rank <= 10) return { tier: 'Elite', color: 'from-blue-400 to-purple-500', icon: Star };
    if (rank <= 25) return { tier: 'Advanced', color: 'from-green-400 to-blue-500', icon: Award };
    if (rank <= 50) return { tier: 'Intermediate', color: 'from-yellow-400 to-green-500', icon: Target };
    return { tier: 'Member', color: 'from-gray-400 to-gray-500', icon: Activity };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!stats || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Statistics not available</p>
      </div>
    );
  }

  const { member } = profile;
  const performanceLevel = getPerformanceLevel(stats.weekly_visits);
  const streakStatus = getStreakStatus(stats.current_streak);
  const weeklyGoal = calculateWeeklyGoal();
  const rankTier = getRankTier(member.rank);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Your Statistics
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Track your progress and performance at the gym
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-300">View:</span>
            {['week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Points */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-yellow-400">
                {stats.total_points.toLocaleString()}
              </span>
            </div>
            <h3 className="font-semibold text-gray-200 mb-1">Total Points</h3>
            <p className="text-sm text-gray-400">All-time earned</p>
          </div>

          {/* Current Streak */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-orange-400">
                {stats.current_streak}
              </span>
            </div>
            <h3 className="font-semibold text-gray-200 mb-1">Current Streak</h3>
            <p className="text-sm text-gray-400">
              {streakStatus.emoji} {streakStatus.status}
            </p>
          </div>

          {/* Level */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {member.level}
              </span>
            </div>
            <h3 className="font-semibold text-gray-200 mb-1">Level</h3>
            <p className="text-sm text-gray-400">
              {member.experience} / {member.level * 1000} XP
            </p>
          </div>

          {/* Global Rank */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-400">
                #{member.rank}
              </span>
            </div>
            <h3 className="font-semibold text-gray-200 mb-1">Global Rank</h3>
            <p className="text-sm text-gray-400">{rankTier.tier}</p>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Goal Progress */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-gray-200">Weekly Goal</h2>
            </div>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stats.weekly_visits} / {weeklyGoal.goal}
              </div>
              <p className="text-gray-400">visits this week</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${weeklyGoal.progress}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-300">
                {weeklyGoal.progress.toFixed(0)}% complete
              </span>
            </div>
          </div>

          {/* Performance Level */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <performanceLevel.icon className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-gray-200">Performance Level</h2>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${performanceLevel.color}`}>
                {performanceLevel.level}
              </div>
              <p className="text-gray-400 mb-4">Based on weekly activity</p>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-300">
                  <div className="flex justify-between mb-2">
                    <span>Weekly Visits:</span>
                    <span className="font-semibold">{stats.weekly_visits}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Monthly Visits:</span>
                    <span className="font-semibold">{stats.monthly_visits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Visits:</span>
                    <span className="font-semibold">{stats.total_visits}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Visit Statistics */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-200">Visit Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">This Week:</span>
                <span className="font-semibold text-gray-200">{stats.weekly_visits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">This Month:</span>
                <span className="font-semibold text-gray-200">{stats.monthly_visits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All Time:</span>
                <span className="font-semibold text-gray-200">{stats.total_visits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Days with Points:</span>
                <span className="font-semibold text-gray-200">{stats.total_days_with_points}</span>
              </div>
            </div>
          </div>

          {/* Streak Statistics */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-200">Streak Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current:</span>
                <span className="font-semibold text-orange-400">{stats.current_streak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Longest:</span>
                <span className="font-semibold text-green-400">{stats.longest_streak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`font-semibold ${streakStatus.color}`}>
                  {streakStatus.emoji} {streakStatus.status}
                </span>
              </div>
            </div>
          </div>

          {/* Points Statistics */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-gray-200">Points Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Points:</span>
                <span className="font-semibold text-yellow-400">{stats.total_points.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg per Visit:</span>
                <span className="font-semibold text-gray-200">{stats.avg_points_per_visit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Experience:</span>
                <span className="font-semibold text-gray-200">{member.experience.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Level:</span>
                <span className="font-semibold text-blue-400">{member.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-200">Achievement Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/30">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-semibold text-gray-200">{profile.badges.length}</div>
              <div className="text-sm text-gray-400">Total Badges</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-semibold text-gray-200">{member.rank}</div>
              <div className="text-sm text-gray-400">Global Rank</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-200">{performanceLevel.level}</div>
              <div className="text-sm text-gray-400">Performance</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-200">{weeklyGoal.progress.toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Goal Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
