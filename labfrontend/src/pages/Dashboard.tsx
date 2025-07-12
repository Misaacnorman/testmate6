import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface DashboardStats {
  totalSamples: number;
  pendingTests: number;
  completedTests: number;
  totalRevenue: number;
  activeUsers: number;
  overdueTests: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSamples: 0,
    pendingTests: 0,
    completedTests: 0,
    totalRevenue: 0,
    activeUsers: 0,
    overdueTests: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API calls when backend endpoints are ready
        // const statsData = await fetch('/api/dashboard/stats');
        // const activityData = await fetch('/api/dashboard/activity');
        
        // For now, keep empty states
        setStats({
          totalSamples: 0,
          pendingTests: 0,
          completedTests: 0,
          totalRevenue: 0,
          activeUsers: 0,
          overdueTests: 0
        });

        setRecentActivity([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sample_received': return '📦';
      case 'test_completed': return '✅';
      case 'sample_registered': return '📝';
      case 'payment_received': return '💰';
      case 'test_started': return '🔬';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Laboratory Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening in your laboratory today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalSamples}</h3>
            <p>Total Samples</p>
            <span className="stat-change neutral">No data available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingTests}</h3>
            <p>Pending Tests</p>
            <span className="stat-change neutral">No data available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedTests}</h3>
            <p>Completed Tests</p>
            <span className="stat-change neutral">No data available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="stat-change neutral">No data available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
            <span className="stat-change neutral">No data available</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.overdueTests}</h3>
            <p>Overdue Tests</p>
            <span className="stat-change neutral">No data available</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn">
            <span className="action-icon">📝</span>
            <span>Register New Sample</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🔬</span>
            <span>Start New Test</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📊</span>
            <span>View Reports</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">💰</span>
            <span>Create Invoice</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">👥</span>
            <span>Manage Users</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">⚙️</span>
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">{formatDate(activity.timestamp)}</span>
                    <span className={`activity-status ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-activity">
            <p>No recent activity to display</p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Test Completion Trend</h3>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '45%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
              <div className="chart-bar" style={{ height: '70%' }}></div>
              <div className="chart-bar" style={{ height: '85%' }}></div>
              <div className="chart-bar" style={{ height: '75%' }}></div>
            </div>
            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3>Revenue Overview</h3>
          <div className="chart-placeholder">
            <div className="revenue-chart">
              <div className="revenue-item">
                <span className="revenue-label">This Week</span>
                <span className="revenue-amount">{formatCurrency(450000)}</span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Last Week</span>
                <span className="revenue-amount">{formatCurrency(380000)}</span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">This Month</span>
                <span className="revenue-amount">{formatCurrency(2450000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
