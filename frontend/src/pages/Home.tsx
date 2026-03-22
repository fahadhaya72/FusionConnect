import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useAppSelector } from '../redux/store';
import api from '../services/api';

interface DashboardStats {
  activeChats: number;
  upcomingMeetings: number;
  teamMembers: number;
  unreadMessages: number;
}

interface Activity {
  id: string;
  type: 'message' | 'meeting' | 'contact' | 'post';
  from: string;
  content: string;
  time: string;
  urgent: boolean;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  type: string;
}

const Home: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeChats: 0,
    upcomingMeetings: 0,
    teamMembers: 0,
    unreadMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/dashboard/stats');
      setStats(statsResponse.data);

      // Fetch recent activity
      const activityResponse = await api.get('/dashboard/activity');
      setRecentActivity(activityResponse.data);

      // Fetch upcoming meetings
      const meetingsResponse = await api.get('/dashboard/meetings');
      setUpcomingMeetings(meetingsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set some default values if API fails
      setStats({
        activeChats: 0,
        upcomingMeetings: 0,
        teamMembers: 0,
        unreadMessages: 0,
      });
      setRecentActivity([]);
      setUpcomingMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getMeetingIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'standup': return '📅';
      case 'review': return '🎯';
      case 'planning': return '🚀';
      default: return '📅';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'meeting': return '📅';
      case 'contact': return '👥';
      case 'post': return '📝';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/20 backdrop-blur rounded-lg p-2">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    { name: 'Start New Chat', path: '/home/chats', icon: '💬', color: 'from-blue-500 to-cyan-500' },
    { name: 'Schedule Meeting', path: '/home/meetings', icon: '📅', color: 'from-purple-500 to-pink-500' },
    { name: 'View Contacts', path: '/home/contacts', icon: '👥', color: 'from-green-500 to-emerald-500' },
    { name: 'Create Post', path: '/home/posts', icon: '📝', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/20 backdrop-blur rounded-lg p-2">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your team today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Chats
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.activeChats}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stats.activeChats > 0 ? 'Active conversations' : 'No active chats'}
                </p>
              </div>
              <div className="text-3xl">💬</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming Meetings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.upcomingMeetings}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stats.upcomingMeetings > 0 ? 'Scheduled today' : 'No meetings today'}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Team Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.teamMembers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Active collaborators
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Unread Messages
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.unreadMessages}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stats.unreadMessages > 0 ? 'Need attention' : 'All caught up'}
                </p>
              </div>
              <div className="text-3xl">📧</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`bg-gradient-to-r ${action.color} text-white rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-medium">{action.name}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.urgent ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.from}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(activity.time)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.content}
                          </p>
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.type === 'message' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              activity.type === 'meeting' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              activity.type === 'contact' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            }`}>
                              {getActivityIcon(activity.type)} {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Events
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getMeetingIcon(meeting.type)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {meeting.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(meeting.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>No upcoming meetings</p>
                </div>
              )}
              <Link
                to="/home/meetings"
                className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                View all meetings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
