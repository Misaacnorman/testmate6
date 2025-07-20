import { useState, useEffect } from 'react';
import './Settings.css';
import { getSettings, updateSetting } from '../api/settingsApi';

interface SystemSettings {
  laboratoryName: string;
  laboratoryCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  calibrationReminders: boolean;
  testCompletionAlerts: boolean;
  overdueSampleAlerts: boolean;
}

interface SecuritySettings {
  sessionTimeout: number;
  passwordExpiryDays: number;
  requireTwoFactor: boolean;
  allowGuestAccess: boolean;
  auditLogging: boolean;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    laboratoryName: '',
    laboratoryCode: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    timezone: 'Africa/Kampala',
    currency: 'UGX',
    dateFormat: 'DD/MM/YYYY',
    language: 'en'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    smsNotifications: false,
    lowStockAlerts: false,
    calibrationReminders: false,
    testCompletionAlerts: false,
    overdueSampleAlerts: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 30,
    passwordExpiryDays: 90,
    requireTwoFactor: false,
    allowGuestAccess: false,
    auditLogging: true
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        if (data && data.length > 0) {
          setSystemSettings(data[0].systemSettings || systemSettings);
          setNotificationSettings(data[0].notificationSettings || notificationSettings);
          setSecuritySettings(data[0].securitySettings || securitySettings);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveStatus('saving');
    try {
      // Save all settings as one object
      await updateSetting(1, {
        key: 'system_config',
        value: JSON.stringify({
          systemSettings,
          notificationSettings,
          securitySettings
        }),
        category: 'system'
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingChange = (field: keyof SystemSettings, value: string) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingChange = (field: keyof SecuritySettings, value: number | boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return '💾 Saving...';
      case 'success': return '✅ Saved Successfully!';
      case 'error': return '❌ Save Failed';
      default: return '💾 Save Settings';
    }
  };

  const getSaveButtonClass = () => {
    switch (saveStatus) {
      case 'saving': return 'save-btn saving';
      case 'success': return 'save-btn success';
      case 'error': return 'save-btn error';
      default: return 'save-btn';
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>System Settings</h1>
        <p>Configure laboratory system preferences and settings</p>
      </div>

      <div className="settings-container">
        {/* Settings Navigation */}
        <div className="settings-nav">
          <button
            className={`nav-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ General Settings
          </button>
          <button
            className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button
            className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
          <button
            className={`nav-tab ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            💾 Backup & Restore
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Laboratory Settings</h2>
              <p>Configure basic laboratory information and system preferences</p>
              
              <div className="settings-form">
                <div className="form-group">
                  <label>Laboratory Name</label>
                  <input
                    type="text"
                    value={systemSettings.laboratoryName}
                    onChange={(e) => handleSystemSettingChange('laboratoryName', e.target.value)}
                    placeholder="Enter laboratory name"
                  />
                </div>

                <div className="form-group">
                  <label>Laboratory Code</label>
                  <input
                    type="text"
                    value={systemSettings.laboratoryCode}
                    onChange={(e) => handleSystemSettingChange('laboratoryCode', e.target.value)}
                    placeholder="Enter laboratory code"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={systemSettings.address}
                    onChange={(e) => handleSystemSettingChange('address', e.target.value)}
                    placeholder="Enter laboratory address"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={systemSettings.phone}
                      onChange={(e) => handleSystemSettingChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={systemSettings.email}
                      onChange={(e) => handleSystemSettingChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={systemSettings.website}
                      onChange={(e) => handleSystemSettingChange('website', e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>

                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) => handleSystemSettingChange('timezone', e.target.value)}
                    >
                      <option value="Africa/Kampala">Africa/Kampala (UTC+3)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                      <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (UTC+3)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={systemSettings.currency}
                      onChange={(e) => handleSystemSettingChange('currency', e.target.value)}
                    >
                      <option value="UGX">Ugandan Shilling (UGX)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date Format</label>
                    <select
                      value={systemSettings.dateFormat}
                      onChange={(e) => handleSystemSettingChange('dateFormat', e.target.value)}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={systemSettings.language}
                    onChange={(e) => handleSystemSettingChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p>Configure how and when you receive system notifications</p>
              
              <div className="settings-form">
                <div className="notification-group">
                  <h3>Notification Channels</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Email Notifications</label>
                      <p>Receive notifications via email</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Test Completion Alerts</label>
                      <p>Get notified when tests are completed</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.testCompletionAlerts}
                        onChange={(e) => handleNotificationSettingChange('testCompletionAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="notification-group">
                  <h3>Alert Types</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Low Stock Alerts</label>
                      <p>Get notified when inventory items are running low</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.lowStockAlerts}
                        onChange={(e) => handleNotificationSettingChange('lowStockAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>System Maintenance Alerts</label>
                      <p>Get notified about system maintenance</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.calibrationReminders}
                        onChange={(e) => handleNotificationSettingChange('calibrationReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p>Configure system security and access control settings</p>
              
              <div className="settings-form">
                <div className="security-group">
                  <h3>Session Management</h3>
                  
                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                    <p className="help-text">Users will be automatically logged out after this period of inactivity</p>
                  </div>
                </div>

                <div className="security-group">
                  <h3>Password Policy</h3>
                  
                  <div className="form-group">
                    <label>Password Expiry (days)</label>
                    <input
                      type="number"
                      value={securitySettings.passwordExpiryDays}
                      onChange={(e) => handleSecuritySettingChange('passwordExpiryDays', parseInt(e.target.value))}
                      min="30"
                      max="365"
                    />
                    <p className="help-text">Users will be required to change their password after this period</p>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Require Two-Factor Authentication</label>
                      <p>Enforce 2FA for all user accounts</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securitySettings.requireTwoFactor}
                        onChange={(e) => handleSecuritySettingChange('requireTwoFactor', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="security-group">
                  <h3>Access Control</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Allow Guest Access</label>
                      <p>Allow limited access without authentication</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securitySettings.allowGuestAccess}
                        onChange={(e) => handleSecuritySettingChange('allowGuestAccess', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Audit Logging</label>
                      <p>Log all user actions for security monitoring</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={securitySettings.auditLogging}
                        onChange={(e) => handleSecuritySettingChange('auditLogging', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <h2>Backup & Restore</h2>
              <p>Manage system backups and data restoration</p>
              
              <div className="backup-section">
                <div className="backup-info">
                  <h3>System Backup</h3>
                  <p>Last backup: <strong>2025-01-28 14:30:00</strong></p>
                  <p>Next scheduled backup: <strong>2025-01-29 02:00:00</strong></p>
                  <p>Backup size: <strong>2.5 GB</strong></p>
                </div>

                <div className="backup-actions">
                  <button className="backup-btn">
                    🔄 Create Manual Backup
                  </button>
                  <button className="restore-btn">
                    📥 Restore from Backup
                  </button>
                  <button className="download-btn">
                    ⬇️ Download Latest Backup
                  </button>
                </div>

                <div className="backup-settings">
                  <h3>Backup Settings</h3>
                  
                  <div className="form-group">
                    <label>Backup Frequency</label>
                    <select defaultValue="daily">
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Retention Period (days)</label>
                    <input type="number" defaultValue="30" min="1" max="365" />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Include Attachments</label>
                      <p>Include file attachments in backups</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Compress Backups</label>
                      <p>Compress backup files to save space</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button
              className={getSaveButtonClass()}
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {getSaveButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 