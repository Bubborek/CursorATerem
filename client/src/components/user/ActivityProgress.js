import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target } from 'lucide-react';

const ActivityProgress = ({ activityPercentage, thisMonthVisits }) => {
  const getActivityColor = (percentage) => {
    if (percentage < 30) return 'from-red-500 to-red-400';
    if (percentage < 70) return 'from-yellow-500 to-yellow-400';
    return 'from-green-500 to-green-400';
  };

  const getActivityText = (percentage) => {
    if (percentage < 30) return 'Getting Started';
    if (percentage < 70) return 'Building Momentum';
    return 'On Fire!';
  };

  const getActivityEmoji = (percentage) => {
    if (percentage < 30) return '🌱';
    if (percentage < 70) return '💪';
    return '🔥';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card card-hover glow-green"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-white">Monthly <span className="gradient-text">Activity</span></h3>
            <p className="text-sm text-gray-300">Your fitness journey this month</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold gradient-text">{thisMonthVisits}</div>
          <div className="text-sm text-gray-300">visits this month</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Activity Level</span>
          <span className="text-lg font-bold gradient-text">
            {Math.round(activityPercentage)}%
          </span>
        </div>
        
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(activityPercentage, 100)}%` }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="progress-fill"
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-400">Low</span>
          <span className="text-sm text-gray-400">Medium</span>
          <span className="text-sm text-gray-400">High</span>
        </div>
      </div>

      {/* Activity Status */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-3xl mr-4">{getActivityEmoji(activityPercentage)}</span>
            <div>
              <p className="text-xl font-bold text-white">{getActivityText(activityPercentage)}</p>
              <p className="text-sm text-gray-300 mt-1">
                {activityPercentage < 30 
                  ? 'Keep going! Every visit counts towards your fitness goals.'
                  : activityPercentage < 70 
                  ? 'Great progress! You\'re building a solid routine.'
                  : 'Amazing! You\'re crushing your fitness goals this month!'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          className="text-center p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Calendar className="h-8 w-8 text-white mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">{thisMonthVisits}</div>
          <div className="text-sm text-blue-200">This Month</div>
        </motion.div>
        
        <motion.div 
          className="text-center p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Target className="h-8 w-8 text-white mx-auto mb-3" />
          <div className="text-2xl font-bold text-white">
            {Math.max(0, 20 - thisMonthVisits)}
          </div>
          <div className="text-sm text-green-200">To Goal (20)</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActivityProgress;
