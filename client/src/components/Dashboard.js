import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../services/api';
import { fixEncoding } from '../utils/encoding';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMemberships: 0,
    todayScans: 0,
    recentAccess: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [membersResponse, logsResponse] = await Promise.all([
        api.get('/api/members'),
        api.get('/api/access/logs?limit=10')
      ]);

      const members = membersResponse.data;
      const logs = logsResponse.data.logs;

      // Calculate stats
      const totalMembers = members.length;
      const activeMemberships = members.reduce((count, member) => {
        return count + member.memberships.filter(m => m.status === 'ACTIVE').length;
      }, 0);

      const today = new Date().toDateString();
      const todayScans = logs.filter(log => 
        new Date(log.scan_time).toDateString() === today
      ).length;

      setStats({
        totalMembers,
        activeMemberships,
        todayScans,
        recentAccess: logs.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Scan QR Code',
      description: 'Scan a member\'s QR code for access',
      icon: QrCode,
      color: 'bg-primary-500',
      href: '/scanner'
    },
    {
      title: 'Manage Members',
      description: 'Add new members or view existing ones',
      icon: Users,
      color: 'bg-success-500',
      href: '/members'
    },
    {
      title: 'View Access Logs',
      description: 'Check recent access attempts',
      icon: FileText,
      color: 'bg-blue-500',
      href: '/logs'
    }
  ];

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Memberships',
      value: stats.activeMemberships,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      title: 'Today\'s Scans',
      value: stats.todayScans,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-300">
          Welcome to the Gym Access Control System
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 lg:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-300">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.href)}
                className="card hover:shadow-lg transition-shadow duration-200 text-left"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-white">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-300">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Access */}
      <div className="mt-6">
        <h2 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Recent Access</h2>
        <div className="card">
          {stats.recentAccess.length === 0 ? (
            <p className="text-gray-300 text-center py-4 text-sm">No recent access attempts</p>
          ) : (
            <div className="flow-root">
              <ul className="-my-3 sm:-my-5 divide-y divide-gray-600">
                {stats.recentAccess.map((log, index) => (
                  <li key={index} className="py-3 sm:py-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="flex-shrink-0">
                        {log.result === 'GRANTED' ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success-500" />
                        ) : (
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-danger-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {log.member ? `${fixEncoding(log.member.first_name)} ${fixEncoding(log.member.last_name)}` : 'Unknown Member'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-300 truncate">
                          {log.member?.email || 'N/A'}
                        </p>
                        {log.staff && (
                          <p className="text-xs text-gray-400 truncate">
                            Scanned by: {fixEncoding(log.staff.first_name)} {fixEncoding(log.staff.last_name)}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-xs sm:text-sm font-medium ${
                          log.result === 'GRANTED' ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {log.result}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-300">
                          {new Date(log.scan_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
