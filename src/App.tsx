import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import NewsAnalyzer from './pages/NewsAnalyzer'
import AnalysisHistory from './pages/AnalysisHistory'
import RealArticles from './pages/RealArticles'
import RealArticleDetail from './pages/RealArticleDetail'
import Profile from './pages/Profile'
import HowItWorks from './pages/HowItWorks'
import SharedResultPage from './pages/SharedResultPage'
import { api, getStoredUser, getToken, setStoredUser, setToken, removeToken, removeStoredUser } from './services/api'
import { supabase } from './services/supabase'

export type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'analyzer'
  | 'analytics'
  | 'history'
  | 'real-articles'
  | 'real-article-detail'
  | 'saved'
  | 'settings'
  | 'profile'
  | 'how-it-works'

export interface User {
  name: string
  email: string
}

const DASH_PAGES: Page[] = [
  'dashboard',
  'analyzer',
  'analytics',
  'history',
  'real-articles',
  'real-article-detail',
  'saved',
  'settings',
  'profile',
  'how-it-works'
]

function Wrap({ id, children }: { id: string; children: React.ReactNode }) {
  return <div key={id} className="page-fade h-full">{children}</div>
}

function getSharedIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  // Check pathname: /shared/:id
  const pathMatch = window.location.pathname.match(/\/shared\/([^/?#]+)/)
  if (pathMatch && pathMatch[1]) return pathMatch[1]

  // Check search params: ?shared=123
  const searchParams = new URLSearchParams(window.location.search)
  const sharedParam = searchParams.get('shared')
  if (sharedParam) return sharedParam

  // Check hash: #/shared/123
  const hashMatch = window.location.hash.match(/#\/?shared\/([^/?#]+)/)
  if (hashMatch && hashMatch[1]) return hashMatch[1]

  return null
}

function getRealArticleIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const pathMatch = window.location.pathname.match(/\/real-articles\/([^/?#]+)/)
  if (pathMatch && pathMatch[1] && pathMatch[1] !== '') return pathMatch[1]
  const hashMatch = window.location.hash.match(/#\/?real-articles\/([^/?#]+)/)
  if (hashMatch && hashMatch[1] && hashMatch[1] !== '') return hashMatch[1]
  return null
}

export default function App() {
  const [user, setUser]         = useState<User | null>(() => {
    const stored = getStoredUser()
    const token = getToken()
    return token && stored ? { name: stored.name, email: stored.email } : null
  })
  const [page, setPage]         = useState<Page>(() => {
    const token = getToken()
    const stored = getStoredUser()
    if (getRealArticleIdFromUrl()) return 'real-article-detail'
    if (window.location.pathname.includes('/real-articles') || window.location.hash.includes('real-articles')) return 'real-articles'
    return token && stored ? 'dashboard' : 'landing'
  })
  const [sharedId, setSharedId] = useState<string | null>(() => getSharedIdFromUrl())
  const [selectedRealArticleId, setSelectedRealArticleId] = useState<string | number | null>(() => getRealArticleIdFromUrl())

  useEffect(() => {
    const handleLocationChange = () => {
      setSharedId(getSharedIdFromUrl())
      const realId = getRealArticleIdFromUrl()
      if (realId) {
        setSelectedRealArticleId(realId)
        setPage('real-article-detail')
      } else if (window.location.pathname.includes('/real-articles') || window.location.hash.includes('real-articles')) {
        setPage('real-articles')
      }
    }
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  // Synchronize session with Supabase Auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u: User = {
          name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
          email: data.session.user.email || ''
        }
        setUser(u)
        setStoredUser({ id: data.session.user.id, name: u.name, email: u.email })
        setToken(data.session.access_token)
      } else {
        const token = getToken()
        if (token) {
          api.getMe().then((me) => {
            if (me) setUser({ name: me.name, email: me.email })
          }).catch(() => {})
        }
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u: User = {
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        }
        setUser(u)
        setStoredUser({ id: session.user.id, name: u.name, email: u.email })
        setToken(session.access_token)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        removeToken()
        removeStoredUser()
        setPage('landing')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])


  const navigate = (p: Page) => {
    if (sharedId) {
      setSharedId(null)
      window.history.pushState({}, '', window.location.pathname.replace(/\/shared.*$/, '/') || '/')
    }
    if (p === 'real-articles') {
      window.history.pushState({}, '', '/real-articles')
    }
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const handleLogin = (u: User) => { setUser(u); navigate('dashboard') }

  // Shared Result route
  if (sharedId) {
    return (
      <SharedResultPage
        shareId={sharedId}
        onNavigateHome={() => {
          setSharedId(null)
          window.history.pushState({}, '', window.location.pathname.replace(/\/shared.*$/, '/') || '/')
          setPage('analyzer')
        }}
      />
    )
  }

  if (DASH_PAGES.includes(page)) {
    return (
      <DashboardLayout page={page === 'real-article-detail' ? 'real-articles' : page} user={user} navigate={navigate}>
        <Wrap id={page}>
          {page === 'dashboard'           && <Dashboard navigate={navigate} user={user} />}
          {page === 'analyzer'            && <NewsAnalyzer navigate={navigate} />}
          {page === 'analytics'           && <Dashboard navigate={navigate} user={user} />}
          {page === 'history'             && <AnalysisHistory navigate={navigate} initialFilter="all" />}
          {page === 'real-articles'       && (
            <RealArticles
              navigate={navigate}
              onSelectArticle={(id) => {
                setSelectedRealArticleId(id)
                window.history.pushState({}, '', `/real-articles/${id}`)
                setPage('real-article-detail')
              }}
            />
          )}
          {page === 'real-article-detail' && selectedRealArticleId && (
            <RealArticleDetail
              articleId={selectedRealArticleId}
              navigate={navigate}
              onBack={() => {
                window.history.pushState({}, '', '/real-articles')
                setPage('real-articles')
              }}
            />
          )}
          {page === 'saved'               && <AnalysisHistory navigate={navigate} initialFilter="saved" />}
          {page === 'settings'            && <Profile navigate={navigate} user={user} initialSection="security" />}
          {page === 'profile'             && <Profile navigate={navigate} user={user} initialSection="account" />}
          {page === 'how-it-works'        && <HowItWorks navigate={navigate} />}
        </Wrap>
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Wrap id={page}>
        {page === 'landing'                    && <Landing navigate={navigate} />}
        {(page === 'login' || page === 'signup') && <AuthPage mode={page} navigate={navigate} onLogin={handleLogin} />}
      </Wrap>
    </div>
  )
}

