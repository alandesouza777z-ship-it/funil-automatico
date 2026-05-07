import { createJSONStorage } from 'zustand/middleware'

export const FUNNEL_STORAGE_KEY = 'funnelby-alanxz7d-state-v2'
export const SESSION_STORAGE_KEY = 'funnelby-alanxz7d-session'
export const MOCK_LOGIN_EMAIL = 'roimaxoficial@gmail.com'

export const funnelStorage = createJSONStorage(() => localStorage)

export const getSessionEmail = () => localStorage.getItem(SESSION_STORAGE_KEY)

export const saveSessionEmail = (email: string) => {
  localStorage.setItem(SESSION_STORAGE_KEY, email)
}

export const clearSessionEmail = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
