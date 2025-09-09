import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import api from '../../services/api';

const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, [currentDate]);

  const fetchActivityData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await api.get(`/api/user/activity-calendar?year=${year}&month=${month}`);
      setActivityData(response.data.activity);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getActivityLevel = (date) => {
    const dateString = date.toDateString();
    const visits = activityData[dateString] || 0;
    
    if (visits === 0) return 'none';
    if (visits === 1) return 'low';
    if (visits <= 3) return 'medium';
    return 'high';
  };

  const getActivityColor = (level) => {
    switch (level) {
      case 'none': return 'bg-gray-100';
      case 'low': return 'bg-green-200';
      case 'medium': return 'bg-green-400';
      case 'high': return 'bg-green-600';
      default: return 'bg-gray-100';
    }
  };

  const getActivityText = (level) => {
    switch (level) {
      case 'none': return 'No visits';
      case 'low': return '1 visit';
      case 'medium': return '2-3 visits';
      case 'high': return '4+ visits';
      default: return 'No visits';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const totalVisits = Object.values(activityData).reduce((sum, visits) => sum + visits, 0);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Attendance Calendar</h3>
            <p className="text-sm text-gray-500">Track your gym visits</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalVisits}</div>
          <div className="text-sm text-gray-500">visits this month</div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((day) => {
          const activityLevel = getActivityLevel(day);
          const visits = activityData[day.toDateString()] || 0;
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: Math.random() * 0.1 }}
              className={`
                p-2 text-center text-sm rounded-lg cursor-pointer transition-all duration-200
                ${getActivityColor(activityLevel)}
                ${isSameMonth(day, currentDate) ? 'text-gray-900' : 'text-gray-400'}
                hover:scale-105 hover:shadow-md
              `}
              title={`${format(day, 'MMM dd')}: ${getActivityText(activityLevel)}`}
            >
              <div className="font-medium">{format(day, 'd')}</div>
              {visits > 0 && (
                <div className="text-xs mt-1">
                  {visits} {visits === 1 ? 'visit' : 'visits'}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
          <span className="text-sm text-gray-600">No visits</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">1 visit</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
          <span className="text-sm text-gray-600">2-3 visits</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
          <span className="text-sm text-gray-600">4+ visits</span>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">Monthly Summary</h4>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          You've visited the gym {totalVisits} times this month. 
          {totalVisits >= 20 
            ? " Amazing consistency! You're crushing your fitness goals!" 
            : totalVisits >= 10 
            ? " Great job! Keep up the momentum!" 
            : " Every visit counts towards building a healthy routine!"
          }
        </p>
      </div>
    </motion.div>
  );
};

export default AttendanceCalendar;
