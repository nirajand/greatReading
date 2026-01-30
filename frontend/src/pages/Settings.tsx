import { useState } from 'react'
import { User, Bell, Eye, Moon, Globe, Shield, Download, LogOut } from 'lucide-react'

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    readingReminders: false,
    weeklyReport: true
  })

  const [readingSettings, setReadingSettings] = useState({
    fontSize: 'medium',
    lineHeight: 'normal',
    theme: 'light',
    autoSave: true,
    defaultTimer: 10
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-gray-600">
            Customize your GreatReading experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Profile Settings</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  defaultValue="reader123"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            
            <button className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              Update Profile
            </button>
          </div>

          {/* Reading Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Reading Preferences</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large', 'x-large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setReadingSettings({...readingSettings, fontSize: size})}
                      className={`px-4 py-2 rounded-lg border ${
                        readingSettings.fontSize === size
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="flex gap-2">
                  {['light', 'sepia', 'dark'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setReadingSettings({...readingSettings, theme})}
                      className={`px-4 py-2 rounded-lg border ${
                        readingSettings.theme === theme
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Timer</label>
                  <select
                    value={readingSettings.defaultTimer}
                    onChange={(e) => setReadingSettings({...readingSettings, defaultTimer: parseInt(e.target.value)})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Line Height</label>
                  <select
                    value={readingSettings.lineHeight}
                    onChange={(e) => setReadingSettings({...readingSettings, lineHeight: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-save Progress</p>
                  <p className="text-sm text-gray-600">Automatically save your reading position</p>
                </div>
                <button
                  onClick={() => setReadingSettings({...readingSettings, autoSave: !readingSettings.autoSave})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    readingSettings.autoSave ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    readingSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <button className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              Save Preferences
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}</p>
                    <p className="text-sm text-gray-600">
                      {key === 'email' && 'Receive email notifications'}
                      {key === 'push' && 'Push notifications in browser'}
                      {key === 'readingReminders' && 'Daily reading reminders'}
                      {key === 'weeklyReport' && 'Weekly progress reports'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, [key]: !value})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Account Actions</h2>
            </div>
            
            <div className="space-y-4">
              <button className="flex items-center gap-3 w-full p-3 text-left rounded-lg border border-gray-300 hover:bg-gray-50">
                <Download className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium">Export My Data</p>
                  <p className="text-sm text-gray-600">Download all your books and reading data</p>
                </div>
              </button>
              
              <button className="flex items-center gap-3 w-full p-3 text-left rounded-lg border border-red-300 hover:bg-red-50 text-red-600">
                <LogOut className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm">Permanently delete your account and all data</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
