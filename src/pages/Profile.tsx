import { useState } from 'react'
import { Page, User } from '../App'
import {
  UserIcon, ShieldIcon, BellIcon, LockIcon, CheckIcon, ArrowRightIcon,
  LogoutIcon, TrendingUpIcon, CheckCircleIcon, AlertTriangle, InfoIcon, EditIcon,
  SunIcon, MoonIcon, MonitorIcon
} from '../components/Icons'
import { useTheme, ThemeMode } from '../utils/theme'
import { api } from '../services/api'


interface Props {
  navigate: (page: Page) => void
  user: User | null
  initialSection?: Section
}

const STATS = [
  { label: 'Total Analyses',  value: '24', Icon: TrendingUpIcon,  color: 'text-primary',   bg: 'bg-primary/10' },
  { label: 'Likely Real',     value: '11', Icon: CheckCircleIcon, color: 'text-real',       bg: 'bg-real-bg' },
  { label: 'Likely Fake',     value: '9',  Icon: AlertTriangle,   color: 'text-fake',       bg: 'bg-fake-bg' },
  { label: 'Uncertain',       value: '4',  Icon: InfoIcon,        color: 'text-uncertain',  bg: 'bg-uncertain-bg' },
]

type Section = 'account' | 'appearance' | 'security' | 'notifications'

export default function Profile({ navigate, user, initialSection = 'account' }: Props) {
  const [activeSection, setActiveSection] = useState<Section>(initialSection)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [editMode, setEditMode] = useState(false)
  const [name, setName]         = useState(user?.name  || 'Demo User')
  const [email, setEmail]       = useState(user?.email || 'demo@truthlens.ai')
  const [saved, setSaved]       = useState(false)

  const [notifs, setNotifs] = useState({
    weeklyDigest:  true,
    newFeatures:   true,
    analysisAlerts:false,
    marketing:     false,
  })

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TL'

  const handleSave = () => {
    setSaved(true)
    setEditMode(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const SIDEBAR_ITEMS: { id: Section; label: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'account',       label: 'Account',       Icon: UserIcon },
    { id: 'appearance',    label: 'Appearance',    Icon: SunIcon },
    { id: 'security',      label: 'Security',      Icon: LockIcon },
    { id: 'notifications', label: 'Notifications', Icon: BellIcon },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto page-fade" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-3xl font-bold text-foreground font-display mb-1">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, appearance, security, and preferences.</p>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0 shadow-sm shadow-primary/20">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground font-display">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 bg-real-bg text-real border border-real-border px-2.5 py-1 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-real" /> Active Member
            </span>
            <span className="text-xs text-muted-foreground">TruthLens AI Verified</span>
          </div>
        </div>
        <button
          onClick={() => { setActiveSection('account'); setEditMode(true) }}
          className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary hover:bg-secondary transition-all flex-shrink-0"
        >
          <EditIcon size={14} /> Edit Profile
        </button>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Settings layout */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="md:w-48 flex md:flex-col gap-2 flex-shrink-0">
          {SIDEBAR_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveSection(id); setEditMode(false) }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeSection === id
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          {/* Account */}
          {activeSection === 'account' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground font-display">Account Details</h3>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="text-xs text-primary font-semibold hover:underline">
                    Edit
                  </button>
                )}
              </div>

              {saved && (
                <div className="flex items-center gap-2 bg-real-bg border border-real-border text-real px-4 py-2.5 rounded-xl text-sm mb-4">
                  <CheckIcon size={14} /> Profile updated successfully.
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name</label>
                  {editMode ? (
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  ) : (
                    <p className="text-sm text-foreground px-4 py-2.5 bg-secondary rounded-xl">{name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Email Address</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  ) : (
                    <p className="text-sm text-foreground px-4 py-2.5 bg-secondary rounded-xl">{email}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Account Plan</label>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-secondary rounded-xl">
                    <p className="text-sm text-foreground font-medium">Standard Plan</p>
                    <span className="text-xs text-primary font-semibold">Active</span>
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-bold text-fake mb-3">Danger Zone</h4>
                <button className="flex items-center gap-2 text-sm font-medium text-fake hover:bg-fake-bg border border-fake-border px-4 py-2.5 rounded-xl transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Appearance / Theme Settings */}
          {activeSection === 'appearance' && (
            <div className="p-6">
              <h3 className="font-bold text-foreground font-display mb-1 text-base">Appearance</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Customize your visual preference. Selected mode will persist permanently.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {/* Light Mode Option */}
                <div
                  onClick={() => setTheme('light')}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center text-center ${
                    theme === 'light'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 bg-secondary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                    <SunIcon size={22} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'light'}
                      onChange={() => setTheme('light')}
                      className="accent-primary"
                    />
                    <span className="text-sm font-bold text-foreground">Light</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cream background with rich olive green accents
                  </p>
                </div>

                {/* Dark Mode Option */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center text-center ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 bg-secondary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <MoonIcon size={22} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'dark'}
                      onChange={() => setTheme('dark')}
                      className="accent-primary"
                    />
                    <span className="text-sm font-bold text-foreground">Dark</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Deep obsidian & olive surfaces with soft contrast
                  </p>
                </div>

                {/* System Default Option */}
                <div
                  onClick={() => setTheme('system')}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center text-center ${
                    theme === 'system'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 bg-secondary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center mb-3">
                    <MonitorIcon size={22} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === 'system'}
                      onChange={() => setTheme('system')}
                      className="accent-primary"
                    />
                    <span className="text-sm font-bold text-foreground">System</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Synchronize automatically with your device theme
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Currently Active:</span>
                <span className="font-semibold text-primary font-mono uppercase tracking-wider">
                  {resolvedTheme} mode ({theme === 'system' ? 'System Sync' : 'Manual'})
                </span>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="p-6">
              <h3 className="font-bold text-foreground font-display mb-6">Security Settings</h3>

              <div className="space-y-4">
                {[
                  { label: 'Change Password',         desc: 'Update your account password',                     action: 'Change' },
                  { label: 'Two-Factor Authentication', desc: '2FA is currently disabled for your account',      action: 'Enable' },
                  { label: 'Active Sessions',          desc: '1 active session (this device)',                   action: 'Manage' },
                  { label: 'API Key',                  desc: 'sk_live_••••••••••••••••••3f8a',                    action: 'Reveal' },
                ].map(({ label, desc, action }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-5 py-4 bg-secondary rounded-xl">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline flex-shrink-0">
                      {action} <ArrowRightIcon size={11} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                <LockIcon size={14} className="text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">All data is encrypted at rest and in transit. TruthLens AI never sells your data.</p>
              </div>

              <button
                onClick={async () => {
                  await api.logout()
                  navigate('landing')
                }}
                className="flex items-center gap-2 mt-4 text-sm font-semibold text-fake hover:bg-fake-bg border border-fake-border px-4 py-2.5 rounded-xl transition-all"
              >
                <LogoutIcon size={15} /> Sign Out of All Devices
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="p-6">
              <h3 className="font-bold text-foreground font-display mb-2">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground mb-6">Choose what emails and alerts you receive from TruthLens.</p>

              <div className="space-y-3">
                {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, value]) => {
                  const labels: Record<keyof typeof notifs, { label: string; desc: string }> = {
                    weeklyDigest:  { label: 'Weekly Digest',    desc: 'A summary of your analysis activity each week.' },
                    newFeatures:   { label: 'Product Updates',  desc: 'News about new TruthLens features and improvements.' },
                    analysisAlerts:{ label: 'Analysis Alerts',  desc: 'Notify me when a long analysis finishes.' },
                    marketing:     { label: 'Promotional Emails',desc: 'Offers, surveys, and marketing communications.' },
                  }
                  const { label, desc } = labels[key]
                  return (
                    <div key={key} className="flex items-start justify-between gap-4 px-5 py-4 bg-secondary rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                        className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200 mt-0.5 ${value ? 'bg-primary' : 'bg-border'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>

              <button className="mt-6 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={async () => {
            await api.logout()
            navigate('landing')
          }}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-fake transition-colors"
        >
          <LogoutIcon size={15} /> Logout
        </button>
      </div>
    </div>
  )
}
