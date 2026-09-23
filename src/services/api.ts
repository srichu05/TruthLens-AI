import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  created_at?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export interface MetricItem {
  label: string
  val: number
}

export interface EvidenceItem {
  source_name: string
  title?: string
  date?: string
  summary: string
  url?: string
  rating?: string
  claim?: string
  claimant?: string
  language?: string
  publisher?: string
  is_live_api?: boolean
}

export interface ClaimItem {
  claim_number: number
  claim: string
  status: 'supported' | 'contradicted' | 'needs_verification'
  explanation: string
  evidence?: EvidenceItem[]
  verified_information?: string
}

export interface ExplanationBreakdown {
  final_reasoning: string
  factcheck_evidence: string
  linguistic_signals: string
}

export interface AnalysisResult {
  id?: number
  input_type?: string
  source_url?: string
  raw_content?: string
  verdict: 'fake' | 'real' | 'uncertain'
  conf: number
  title?: string
  summary: string
  claims: string[]
  detailed_claims?: ClaimItem[]
  metrics: MetricItem[]
  metadata?: Record<string, any>
  explanation_breakdown?: ExplanationBreakdown
  is_bookmarked?: boolean
  created_at?: string
}

export interface HistoryItem {
  id: number
  title?: string
  snippet: string
  input_type: string
  verdict: 'fake' | 'real' | 'uncertain'
  confidence: number
  summary: string
  claims: string[]
  detailed_claims?: ClaimItem[]
  metrics: MetricItem[]
  is_bookmarked: boolean
  created_at: string
}

export interface DashboardStatsData {
  total_scans: number
  real_count: number
  fake_count: number
  uncertain_count: number
  real_articles_count?: number
  avg_confidence: number
  accuracy_rate: number
}

export interface RealArticleItem {
  id: number
  analysis_id?: number
  input_type: string
  original_title: string
  original_claim: string
  original_verdict: 'fake' | 'uncertain'
  confidence: number
  what_was_wrong: string
  what_actually_happened: string
  verified_source_name: string
  verified_source_url?: string
  sources?: EvidenceItem[]
  claims_breakdown?: ClaimItem[]
  created_at: string
}



// Token & User storage helpers
export const getToken = (): string | null => {
  try {
    const sessionStr = localStorage.getItem('truthlens_supabase_session')
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr)
      if (parsed?.access_token) return parsed.access_token
    }
  } catch {}
  return localStorage.getItem('truthlens_token')
}
export const setToken = (token: string) => localStorage.setItem('truthlens_token', token)
export const removeToken = () => {
  localStorage.removeItem('truthlens_token')
  localStorage.removeItem('truthlens_supabase_session')
}

export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem('truthlens_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export const setStoredUser = (user: UserProfile) => localStorage.setItem('truthlens_user', JSON.stringify(user))
export const removeStoredUser = () => localStorage.removeItem('truthlens_user')

const getHeaders = (isJson: boolean = true) => {
  const headers: Record<string, string> = {}
  if (isJson) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// API methods
export const api = {
  // Auth via Supabase
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) {
      throw new Error(error.message || 'Registration failed')
    }

    const userProfile: UserProfile = {
      id: data.user?.id || '',
      name: data.user?.user_metadata?.name || name,
      email: data.user?.email || email,
    }
    const token = data.session?.access_token || ''
    if (token) {
      setToken(token)
      setStoredUser(userProfile)
    }

    return {
      access_token: token,
      token_type: 'bearer',
      user: userProfile
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message || 'Invalid email or password')
    }

    const userProfile: UserProfile = {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || email,
    }
    const token = data.session?.access_token || ''
    if (token) {
      setToken(token)
      setStoredUser(userProfile)
    }

    return {
      access_token: token,
      token_type: 'bearer',
      user: userProfile
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch {}
    removeToken()
    removeStoredUser()
  },

  async getMe(): Promise<UserProfile | null> {
    const token = getToken()
    if (!token) return null
    try {
      // Check active Supabase user session
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
        }
        setStoredUser(userProfile)
        return userProfile
      }

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(),
      })
      if (!res.ok) {
        removeToken()
        removeStoredUser()
        return null
      }
      const user = await res.json()
      setStoredUser(user)
      return user
    } catch {
      return null
    }
  },


  // News Analysis
  async analyzeTextOrUrl(params: { mode: 'text' | 'url'; content?: string; url?: string; title?: string }): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis failed' }))
      throw new Error(err.detail || 'Analysis failed')
    }
    return await res.json()
  },

  async analyzeFile(file: File): Promise<AnalysisResult> {
    const formData = new FormData()
    formData.append('file', file)
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE_URL}/analyze/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'File upload analysis failed' }))
      throw new Error(err.detail || 'File analysis failed')
    }
    return await res.json()
  },

  async getAnalysisById(id: number | string): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE_URL}/analyze/${id}`, {
      headers: getHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis not found' }))
      throw new Error(err.detail || 'Analysis not found')
    }
    return await res.json()
  },

  async getHistory(params?: { search?: string; verdict?: string; bookmarked?: boolean }): Promise<HistoryItem[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.append('search', params.search)
      if (params?.verdict && params.verdict !== 'all') searchParams.append('verdict', params.verdict)
      if (params?.bookmarked !== undefined) searchParams.append('bookmarked', String(params.bookmarked))

      const res = await fetch(`${API_BASE_URL}/history?${searchParams.toString()}`, {
        headers: getHeaders(),
      })
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },

  async deleteHistory(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/history/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  },

  async toggleBookmark(id: number): Promise<{ id: number; is_bookmarked: boolean }> {
    const res = await fetch(`${API_BASE_URL}/history/${id}/bookmark`, {
      method: 'PATCH',
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error('Failed to toggle bookmark')
    return await res.json()
  },

  async getDashboardStats(): Promise<DashboardStatsData> {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch stats')
    return await res.json()
  },

  async getRealArticles(params?: { search?: string; verdict?: string }): Promise<RealArticleItem[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.append('search', params.search)
      if (params?.verdict && params.verdict !== 'all') searchParams.append('verdict', params.verdict)

      const res = await fetch(`${API_BASE_URL}/real-articles?${searchParams.toString()}`, {
        headers: getHeaders(),
      })
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },

  async getRealArticleById(id: number | string): Promise<RealArticleItem> {
    const res = await fetch(`${API_BASE_URL}/real-articles/${id}`, {
      headers: getHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Real Article not found' }))
      throw new Error(err.detail || 'Real Article not found')
    }
    return await res.json()
  }
}

