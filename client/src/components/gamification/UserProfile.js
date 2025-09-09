import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Award, Trophy, Star, Target, Calendar, TrendingUp, Zap, Crown } from 'lucide-react';
import api from '../../services/api';

const UserProfile = ({ memberId }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ bio: '', avatar_url: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, statsResponse] = await Promise.all([
        api.get(`/api/user/profile/${memberId}`),
        api.get(`/api/user/stats/${memberId}`)
      ]);
      
      setProfile(profileResponse.data);
      setStats(statsResponse.data);
      setEditData({
        bio: profileResponse.data.member.bio || '',
        avatar_url: profileResponse.data.member.avatar_url || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchProfile();
    }
  }, [memberId]);

  const handleSave = async () => {
    try {
      await api.patch(`/api/user/profile/${memberId}`, editData);
      setEditing(false);
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      bio: profile.member.bio || '',
      avatar_url: profile.member.avatar_url || ''
    });
    setEditing(false);
  };

  const getBadgeRarityColor = (rarity) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-700 border-gray-600 text-gray-300';
      case 'RARE': return 'bg-blue-900/50 border-blue-500 text-blue-300';
      case 'EPIC': return 'bg-purple-900/50 border-purple-500 text-purple-300';
      case 'LEGENDARY': return 'bg-yellow-900/50 border-yellow-500 text-yellow-300';
      default: return 'bg-gray-700 border-gray-600 text-gray-300';
    }
  };

  const getBadgeRarityIcon = (rarity) => {
    switch (rarity) {
      case 'COMMON': return '🥉';
      case 'RARE': return '🥈';
      case 'EPIC': return '🥇';
      case 'LEGENDARY': return '👑';
      default: return '🏆';
    }
  };

  const calculateProgressToNextLevel = () => {
    if (!profile) return 0;
    const currentLevelExp = (profile.member.level - 1) * 1000;
    const nextLevelExp = profile.member.level * 1000;
    const progress = ((profile.member.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Profile not found</p>
      </div>
    );
  }

  const { member, badges, recent_points } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.username}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  member.username?.charAt(0).toUpperCase() || member.first_name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                {member.level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-200">
                  {member.username || `${member.first_name} ${member.last_name}`}
                </h1>
                {editing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{member.total_points.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{member.current_streak}</div>
                  <div className="text-sm text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{member.longest_streak}</div>
                  <div className="text-sm text-gray-400">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">#{member.rank}</div>
                  <div className="text-sm text-gray-400">Global Rank</div>
                </div>
              </div>

              {/* Bio */}
              {editing ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                  <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">Avatar URL</label>
                  <input
                    type="url"
                    value={editData.avatar_url}
                    onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-gray-300">
                    {member.bio || "No bio available. Click edit to add one!"}
                  </p>
                </div>
              )}

              {/* Level Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Level {member.level} Progress</span>
                  <span className="text-sm text-gray-400">{member.experience} / {member.level * 1000} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgressToNextLevel()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-200">{stats.total_visits}</div>
              <div className="text-sm text-gray-400">Total Visits</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-200">{stats.weekly_visits}</div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-200">{stats.monthly_visits}</div>
              <div className="text-sm text-gray-400">This Month</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="w-12 h-12 bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-200">{stats.avg_points_per_visit}</div>
              <div className="text-sm text-gray-400">Avg Points/Visit</div>
            </div>
          </div>
        )}

        {/* Badges Section */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-200">Achievements</h2>
            <span className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500">
              {badges.length} badges
            </span>
          </div>

          {badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.badge_id}
                  className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg ${getBadgeRarityColor(badge.rarity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{badge.icon_url}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{badge.name}</h3>
                        <span className="text-lg">{getBadgeRarityIcon(badge.rarity)}</span>
                      </div>
                      <p className="text-sm opacity-75 mb-2">{badge.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium opacity-60">
                          {new Date(badge.earned_date).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-bold">+{badge.point_value} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No badges earned yet. Keep visiting the gym to unlock achievements!</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recent_points && recent_points.length > 0 && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-200">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {recent_points.slice(0, 10).map((point, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {point.total_points}
                    </div>
                    <div>
                      <div className="font-medium text-gray-200">Gym Visit</div>
                      <div className="text-sm text-gray-400">
                        {new Date(point.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-400">
                      +{point.total_points} points
                    </div>
                    <div className="text-sm text-gray-400">
                      {point.streak_multiplier > 1 && `${point.streak_multiplier.toFixed(1)}x streak`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
