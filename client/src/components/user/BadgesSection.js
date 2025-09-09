import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Target, Calendar, Zap, Eye, Lock } from 'lucide-react';
import api from '../../services/api';

const BadgesSection = ({ badges }) => {
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBadges();
  }, []);

  const fetchAllBadges = async () => {
    try {
      // Since we don't have a specific endpoint for all badges, we'll create a mock list
      // In a real app, you'd have an API endpoint like /api/badges
      const mockBadges = [
        {
          badge_id: '1',
          name: 'First Visit',
          description: 'Welcome to the gym! Your first visit is complete.',
          icon_url: '🏋️',
          criteria: JSON.stringify({ visits: 1 })
        },
        {
          badge_id: '2',
          name: 'Regular Visitor',
          description: 'You\'ve visited 10 times! Keep up the great work.',
          icon_url: '💪',
          criteria: JSON.stringify({ visits: 10 })
        },
        {
          badge_id: '3',
          name: 'Streak Master',
          description: 'You\'ve maintained a 7-day streak!',
          icon_url: '🔥',
          criteria: JSON.stringify({ streak: 7 })
        },
        {
          badge_id: '4',
          name: 'Monthly Champion',
          description: 'You\'ve visited 20 times this month!',
          icon_url: '🏆',
          criteria: JSON.stringify({ monthly_visits: 20 })
        },
        {
          badge_id: '5',
          name: 'Early Bird',
          description: 'You\'ve visited before 7 AM!',
          icon_url: '🌅',
          criteria: JSON.stringify({ early_visits: 5 })
        },
        {
          badge_id: '6',
          name: 'Weekend Warrior',
          description: 'You\'ve visited on weekends 10 times!',
          icon_url: '⚔️',
          criteria: JSON.stringify({ weekend_visits: 10 })
        }
      ];
      setAllBadges(mockBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBadgeEarned = (badgeId) => {
    return badges.some(badge => badge.badge_id === badgeId);
  };

  const getEarnedBadge = (badgeId) => {
    return badges.find(badge => badge.badge_id === badgeId);
  };
  const getBadgeIcon = (badgeName) => {
    const name = badgeName.toLowerCase();
    if (name.includes('first') || name.includes('welcome')) return '🎉';
    if (name.includes('regular') || name.includes('visitor')) return '💪';
    if (name.includes('streak')) return '🔥';
    if (name.includes('monthly') || name.includes('champion')) return '🏆';
    if (name.includes('dedication')) return '⭐';
    if (name.includes('consistency')) return '🎯';
    return '🏅';
  };

  const getBadgeColor = (badgeName) => {
    const name = badgeName.toLowerCase();
    if (name.includes('first') || name.includes('welcome')) return 'from-blue-500 to-blue-600';
    if (name.includes('regular') || name.includes('visitor')) return 'from-green-500 to-green-600';
    if (name.includes('streak')) return 'from-orange-500 to-orange-600';
    if (name.includes('monthly') || name.includes('champion')) return 'from-purple-500 to-purple-600';
    if (name.includes('dedication')) return 'from-yellow-500 to-yellow-600';
    if (name.includes('consistency')) return 'from-red-500 to-red-600';
    return 'from-gray-500 to-gray-600';
  };

  const getBadgeRarity = (badgeName) => {
    const name = badgeName.toLowerCase();
    if (name.includes('champion') || name.includes('master')) return 'legendary';
    if (name.includes('streak') || name.includes('monthly')) return 'epic';
    if (name.includes('regular') || name.includes('dedication')) return 'rare';
    return 'common';
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'Legendary';
      case 'epic': return 'Epic';
      case 'rare': return 'Rare';
      default: return 'Common';
    }
  };

  if (badges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Yet</h3>
          <p className="text-gray-500 mb-4">
            Start visiting the gym regularly to earn your first badge!
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg">
            <Target className="h-4 w-4 mr-2" />
            Keep going to unlock achievements!
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="card card-hover glow-orange">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-white">Your <span className="gradient-text">Badges</span></h3>
              <p className="text-sm text-gray-300">{badges.length} badges earned</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold gradient-text">{badges.length}</div>
            <div className="text-sm text-gray-300">total badges</div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge, index) => {
          const rarity = getBadgeRarity(badge.name);
          const rarityColor = getRarityColor(rarity);
          const badgeColor = getBadgeColor(badge.name);
          const badgeIcon = badge.icon_url || getBadgeIcon(badge.name);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card border-2 ${rarityColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 glow-orange`}
              whileHover={{ y: -5 }}
            >
              <div className="text-center">
                {/* Badge Icon */}
                <motion.div 
                  className={`h-20 w-20 bg-gradient-to-r ${badgeColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-3xl">{badgeIcon}</span>
                </motion.div>
                
                {/* Badge Name */}
                <h4 className="text-xl font-bold text-white mb-3">{badge.name}</h4>
                
                {/* Badge Description */}
                <p className="text-sm text-gray-300 mb-4">{badge.description}</p>
                
                {/* Rarity Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' :
                  rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' :
                  rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' :
                  'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                }`}>
                  {getRarityText(rarity)}
                </div>
                
                {/* Earned Date */}
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="flex items-center justify-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    Earned {new Date(badge.earned_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Progress */}
      <div className="card card-hover glow-green">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center">
          <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
            <Star className="h-4 w-4 text-white" />
          </div>
          Achievement Progress
        </h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-400 mr-3" />
              <span className="text-lg font-semibold text-white">Badge Collector</span>
            </div>
            <div className="text-lg font-bold gradient-text">
              {badges.length}/10 badges
            </div>
          </div>
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((badges.length / 10) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Available Badges Section */}
      <div className="card card-hover glow-red">
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-white">Available <span className="gradient-text">Badges</span></h3>
            <p className="text-sm text-gray-300">All badges you can earn</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBadges.map((badge, index) => {
              const earned = isBadgeEarned(badge.badge_id);
              const earnedBadge = earned ? getEarnedBadge(badge.badge_id) : null;
              const rarity = getBadgeRarity(badge.name);
              const rarityColor = getRarityColor(rarity);
              const badgeColor = getBadgeColor(badge.name);
              
              return (
                <motion.div
                  key={badge.badge_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative border-2 rounded-2xl p-6 transition-all duration-300 ${
                    earned 
                      ? `${rarityColor} hover:shadow-2xl hover:scale-105 glow-orange` 
                      : 'border-gray-600 bg-gray-800/50 opacity-60'
                  }`}
                  whileHover={{ y: earned ? -5 : 0 }}
                >
                  {/* Lock icon for unearned badges */}
                  {!earned && (
                    <div className="absolute top-4 right-4">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  
                  <div className="text-center">
                    {/* Badge Icon */}
                    <motion.div 
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                        earned 
                          ? `bg-gradient-to-r ${badgeColor} shadow-2xl` 
                          : 'bg-gray-700'
                      }`}
                      whileHover={{ rotate: earned ? 5 : 0, scale: earned ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className={`text-2xl ${earned ? '' : 'grayscale opacity-50'}`}>
                        {badge.icon_url}
                      </span>
                    </motion.div>
                    
                    {/* Badge Name */}
                    <h4 className={`text-lg font-bold mb-3 ${
                      earned ? 'text-white' : 'text-gray-500'
                    }`}>
                      {badge.name}
                    </h4>
                    
                    {/* Badge Description */}
                    <p className={`text-sm mb-4 ${
                      earned ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {badge.description}
                    </p>
                    
                    {/* Rarity Badge */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      earned 
                        ? (rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' :
                           rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' :
                           rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' :
                           'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg')
                        : 'bg-gray-700 text-gray-500'
                    }`}>
                      {getRarityText(rarity)}
                    </div>
                    
                    {/* Earned Date or Status */}
                    <div className="mt-6 pt-4 border-t border-gray-600">
                      {earned ? (
                        <div className="flex items-center justify-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          Earned {new Date(earnedBadge.earned_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Target className="h-3 w-3 mr-1" />
                          Not earned yet
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="card bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30 glow-red">
        <div className="flex items-center">
          <div className="h-14 w-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div className="ml-6">
            <h4 className="text-xl font-bold text-white">Keep Going!</h4>
            <p className="text-sm text-gray-300 mt-2">
              {badges.length < 5 
                ? "You're just getting started! Visit the gym regularly to unlock more badges."
                : badges.length < 10
                ? "Great progress! You're well on your way to becoming a gym champion."
                : "Incredible! You're a true fitness champion with an impressive badge collection!"
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BadgesSection;
