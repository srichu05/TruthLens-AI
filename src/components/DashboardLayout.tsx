import { ReactNode, useState } from 'react'
import { Page, User } from '../App'
import {
  HomeIcon, ZapIcon, ClockIcon, BookmarkIcon,
  SettingsIcon, UserIcon, LogoutIcon, ShieldIcon, MenuIcon, XIcon,
  SunIcon, MoonIcon, NewspaperIcon, TrendingUpIcon
} from './Icons'
import { useTheme } from '../utils/theme'
import { api } from '../services/api'

interface Props {
  page: Page
  user: User | null
  navigate: (page: Page) => void
  children: ReactNode
}


const NAV = [
  { id: 'dashboard'     as Page, label: 'Dashboard',        Icon: HomeIcon },
  { id: 'analyzer'      as Page, label: 'Detector',         Icon: ZapIcon },
  { id: 'analytics'     as Page, label: 'Analytics',        Icon: TrendingUpIcon },
  { id: 'history'       as Page, label: 'History',          Icon: ClockIcon },
  { id: 'real-articles' as Page, label: 'Real Articles',    Icon: NewspaperIcon },
  { id: 'saved'         as Page, label: 'Saved Results',    Icon: BookmarkIcon },
]


const BOTTOM_NAV = [
  { id: 'settings'   as Page, label: 'Settings',  Icon: SettingsIcon },
  { id: 'profile'    as Page, label: 'Profile',   Icon: UserIcon },
]

export default function DashboardLayout({ page, user, navigate, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TL'

  const handleLogout = async () => {
    await api.logout()
    navigate('landing')
    setMobileOpen(false)
  }


  const toggleLightDark = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const SidebarInner = () => (
    <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-fg">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <button
          onClick={() => { navigate('dashboard'); setMobileOpen(false) }}
          className="flex items-center gap-3 w-full group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
            <ShieldIcon size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white font-display leading-none group-hover:text-primary-foreground group-hover:brightness-125 transition-all">
              TruthLens
            </p>
            <p className="text-xs text-[#9EAA8E] leading-none mt-1 font-mono font-medium">
              AI · Credibility
            </p>
          </div>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-bold text-[#9EAA8E] uppercase tracking-wider px-3 mb-2 font-mono">
          Navigation
        </p>
        {NAV.map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <button
              key={id + label}
              onClick={() => { navigate(id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-[#D2D8C7] hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-[#A9B39F]'} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3 space-y-1">
        {/* Quick Theme Switcher */}
        <button
          onClick={toggleLightDark}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#D2D8C7] hover:text-white hover:bg-white/10 transition-all"
        >
          <span className="flex items-center gap-2.5">
            {resolvedTheme === 'dark' ? <MoonIcon size={15} className="text-primary" /> : <SunIcon size={15} className="text-amber-400" />}
            <span>{resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10 font-bold">
            {theme}
          </span>
        </button>

        {BOTTOM_NAV.map(({ id, label, Icon }) => {
          const active = page === id
          return (
            <button
              key={label}
              onClick={() => { navigate(id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-[#D2D8C7] hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-[#A9B39F]'} />
              <span>{label}</span>
            </button>
          )
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#D2D8C7] hover:text-fake hover:bg-fake-bg/40 transition-all"
        >
          <LogoutIcon size={16} />
          <span>Logout</span>
        </button>

        {/* User pill */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Demo User'}</p>
            <p className="text-[11px] text-[#A2A995] truncate font-mono">{user?.email || 'user@truthlens.ai'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-sidebar-bg border-r border-sidebar-border">
        <SidebarInner />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col shadow-2xl bg-sidebar-bg border-r border-sidebar-border">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-[#D2D8C7] hover:text-white transition-colors p-1"
            >
              <XIcon size={18} />
            </button>
            <SidebarInner />
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-card border-b border-border flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground p-1"
          >
            <MenuIcon size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldIcon size={14} />
            </div>
            <span className="font-bold text-foreground text-sm font-display">TruthLens AI</span>
          </div>
          <button
            onClick={toggleLightDark}
            className="p-2 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
