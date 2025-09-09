import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Calendar, Users } from 'lucide-react';
import api from '../../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [limit, setLimit] = useState(50);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/leaderboard?type=${type}&limit=${limit}`);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [type, limit]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    if (rank <= 10) return <Star className="w-5 h-5 text-blue-500" />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    return 'bg-white border border-gray-200';
  };

  const formatPoints = (points) => {
    if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
    if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
    return points.toString();
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-red-600 font-bold';
    if (streak >= 14) return 'text-orange-600 font-semibold';
    if (streak >= 7) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Compete with fellow gym members and climb the ranks!
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-300">Time Period:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All Time', icon: Trophy },
                  { key: 'weekly', label: 'This Week', icon: TrendingUp },
                  { key: 'monthly', label: 'This Month', icon: Calendar }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      type === key
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-300">Show:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value={10}>Top 10</option>
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left font-semibold">Member</th>
                    <th className="px-6 py-4 text-left font-semibold">Level</th>
                    <th className="px-6 py-4 text-left font-semibold">Points</th>
                    <th className="px-6 py-4 text-left font-semibold">Streak</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((member, index) => (
                    <tr
                      key={member.member_id}
                      className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(member.rank)}
                          <span className="font-bold text-lg text-gray-200">{member.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.display_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              member.display_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-200">
                              {member.display_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {member.first_name} {member.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {member.level}
                          </div>
                          <span className="font-semibold text-gray-200">Level {member.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg text-yellow-400">
                          {formatPoints(member.total_points)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-semibold ${getStreakColor(member.current_streak)}`}>
                          {member.current_streak} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          member.rank <= 3
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : member.rank <= 10
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {member.rank <= 3 ? '🏆 Champion' : member.rank <= 10 ? '⭐ Elite' : '💪 Member'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {!loading && leaderboard.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {leaderboard[0]?.total_points.toLocaleString()}
              </div>
              <div className="text-gray-300">Highest Score</div>
              <div className="text-sm text-gray-400 mt-1">
                by {leaderboard[0]?.display_name}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {Math.max(...leaderboard.map(m => m.current_streak))}
              </div>
              <div className="text-gray-300">Longest Streak</div>
              <div className="text-sm text-gray-400 mt-1">Current Active</div>
            </div>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {Math.max(...leaderboard.map(m => m.level))}
              </div>
              <div className="text-gray-300">Highest Level</div>
              <div className="text-sm text-gray-400 mt-1">Achieved</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
