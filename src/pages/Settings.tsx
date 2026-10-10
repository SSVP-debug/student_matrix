import { Sidebar } from '../components/Sidebar';
import { User, Bell, Palette, Shield, Globe, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsData {
  profile: {
    displayName: string;
    email: string;
    profilePic: string;
  };
  notifications: {
    dailyReminders: boolean;
    achievementUnlocked: boolean;
    streakAlerts: boolean;
    missionUpdates: boolean;
  };
  appearance: {
    theme: string;
  };
  language: string;
}

export const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      displayName: 'Zero',
      email: 'zero@stellarlearn.space',
      profilePic: 'https://res.cloudinary.com/dhn92qb61/image/upload/v1751381563/Gojo__o3vpim.webp'
    },
    notifications: {
      dailyReminders: true,
      achievementUnlocked: true,
      streakAlerts: true,
      missionUpdates: true
    },
    appearance: {
      theme: 'Cosmic Dark'
    },
    language: 'English'
  });

  const [isSaved, setIsSaved] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('student_matrixSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stellarLearnSettings', JSON.stringify(settings));
  }, [settings]);

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            profilePic: e.target?.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fixed handleInputChange function
  const handleInputChange = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => {
      if (section === 'language') {
        return {
          ...prev,
          language: value
        };
      }
      
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      };
    });
  };

  const handleNotificationToggle = (notification: keyof SettingsData['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: !prev.notifications[notification]
      }
    }));
  };

  const themes = ['Cosmic Dark', 'Nebula Gray', 'Stellar White'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
              <p className="text-white/60 capitalize">Customize your learning experience</p>
            </div>
            
            <button
              onClick={handleSaveSettings}
              className={`px-6 py-3 rounded-2xl border transition-all duration-300 ${
                isSaved 
                  ? 'border-white bg-white text-black' 
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isSaved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Profile</h2>
                  <p className="text-sm text-white/60">Manage your account information</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                      {settings.profile.profilePic ? (
                        <img 
                          src={settings.profile.profilePic} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white/60" />
                      )}
                    </div>
                    <label 
                      htmlFor="profilePic"
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center cursor-pointer hover:bg-white/90 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-black" />
                    </label>
                    <input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Profile Picture</h3>
                    <p className="text-white/60 text-sm">Upload a photo from your device</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) => handleInputChange('profile', 'displayName', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-white/50 focus:bg-white/10 outline-none text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-white/50 focus:bg-white/10 outline-none text-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Notifications */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                  <p className="text-sm text-white/60">Configure your alerts and reminders</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'dailyReminders', label: 'Daily Reminders' },
                  { key: 'achievementUnlocked', label: 'Achievement Unlocked' },
                  { key: 'streakAlerts', label: 'Streak Alerts' },
                  { key: 'missionUpdates', label: 'Mission Updates' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer group p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <span className="text-white group-hover:text-white/90 transition-colors">{label}</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications[key as keyof SettingsData['notifications']]} 
                        onChange={() => handleNotificationToggle(key as keyof SettingsData['notifications'])}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-6 bg-white/10 rounded-full peer-checked:bg-white transition-all" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white/60 rounded-full transition-transform peer-checked:translate-x-6 peer-checked:bg-white" />
                    </div>
                  </label>
                ))}
              </div>
            </GlassCard>

            {/* Appearance */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Appearance</h2>
                  <p className="text-sm text-white/60">Customize the visual experience</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Theme</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handleInputChange('appearance', 'theme', theme)}
                        className={`px-4 py-3 rounded-2xl border transition-all ${
                          settings.appearance.theme === theme
                            ? 'border-white bg-white/20 text-white'
                            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Language & Region */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Language & Region</h2>
                  <p className="text-sm text-white/60">Set your preferred language</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Language</label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-white/50 focus:bg-white/10 outline-none text-white transition-all"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </GlassCard>

            {/* Privacy & Security */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
                  <p className="text-sm text-white/60">Manage your data and security settings</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-white text-left transition-all">
                  Change Password
                </button>
                <button className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-white text-left transition-all">
                  Download My Data
                </button>
                <button className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 hover:bg-red-500/10 hover:border-red-500/50 text-red-400 text-left transition-all">
                  Delete Account
                </button>
              </div>
            </GlassCard>

            {/* Data Management */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Data Management</h3>
                  <p className="text-white/60 text-sm">Clear all local storage data</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('student_matrixSettings');
                    setSettings({
                      profile: {
                        displayName: 'Explorer',
                        email: 'explorer@student_matrix.space',
                        profilePic: ''
                      },
                      notifications: {
                        dailyReminders: true,
                        achievementUnlocked: true,
                        streakAlerts: true,
                        missionUpdates: true
                      },
                      appearance: {
                        theme: 'Cosmic Dark'
                      },
                      language: 'English'
                    });
                  }}
                  className="px-4 py-2 rounded-2xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};