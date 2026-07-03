export type Theme = 'navy' | 'light' | 'dark' | 'auto'

export const themes = {
  navy: {
    name: 'Dark Navy',
    '--bg': '#0f1f3d',
    '--bg-card': '#1a2f54',
    '--bg-modal': '#162848',
    '--bg-subject': 'rgba(255,255,255,0.04)',
    '--border': 'rgba(255,255,255,0.1)',
    '--border-accent': 'rgba(245,158,11,0.2)',
    '--text': '#ffffff',
    '--text-muted': 'rgba(255,255,255,0.4)',
    '--text-blocked': 'rgba(255,255,255,0.25)',
    '--accent': '#f59e0b',
    '--accent-text': '#0f1f3d',
    '--banner-from': '#1a2f54',
    '--banner-to': '#2563b0',
    '--progress-bg': 'rgba(255,255,255,0.1)',
    '--year-badge': 'rgba(245,158,11,0.1)',
    '--year-badge-border': 'rgba(245,158,11,0.25)',
    '--year-badge-text': '#fcd34d',
    '--section-text': 'rgba(255,255,255,0.3)',
    '--success': '#10b981',
    '--danger': '#ef4444',
    '--info': '#3b82f6',
    '--cursada': '#eab308',
    '--en-curso': '#8b5cf6',
    '--selected': '#8b5cf6',
    '--shadow-card': 'none',
    '--shadow-elevated': 'none',
  },
  light: {
    name: 'Claro',
    '--bg': '#f1f5f9',
    '--bg-card': '#ffffff',
    '--bg-modal': '#ffffff',
    '--bg-subject': '#f8fafc',
    '--border': '#cbd5e1',
    '--border-accent': '#93c5fd',
    '--text': '#0f172a',
    '--text-muted': '#475569',
    '--text-blocked': '#a1a1aa',
    '--accent': '#2563eb',
    '--accent-text': '#ffffff',
    '--banner-from': '#1e40af',
    '--banner-to': '#3b82f6',
    '--progress-bg': '#e2e8f0',
    '--year-badge': '#eff6ff',
    '--year-badge-border': '#93c5fd',
    '--year-badge-text': '#1e40af',
    '--section-text': '#475569',
    '--success': '#16a34a',
    '--danger': '#dc2626',
    '--info': '#2563eb',
    '--cursada': '#ca8a04',
    '--en-curso': '#7c3aed',
    '--selected': '#7c3aed',
    '--shadow-card': '0 1px 3px rgba(0,0,0,0.08)',
    '--shadow-elevated': '0 4px 12px rgba(0,0,0,0.1)',
  },
  dark: {
    name: 'Dark IDE',
    '--bg': '#1a1a2e',
    '--bg-card': '#16213e',
    '--bg-modal': '#16213e',
    '--bg-subject': 'rgba(255,255,255,0.03)',
    '--border': 'rgba(255,255,255,0.08)',
    '--border-accent': 'rgba(139,92,246,0.3)',
    '--text': '#ffffff',
    '--text-muted': 'rgba(255,255,255,0.4)',
    '--text-blocked': 'rgba(255,255,255,0.2)',
    '--accent': '#8b5cf6',
    '--accent-text': '#ffffff',
    '--banner-from': '#16213e',
    '--banner-to': '#0f3460',
    '--progress-bg': 'rgba(255,255,255,0.08)',
    '--year-badge': 'rgba(139,92,246,0.1)',
    '--year-badge-border': 'rgba(139,92,246,0.25)',
    '--year-badge-text': '#a78bfa',
    '--section-text': 'rgba(255,255,255,0.25)',
    '--success': '#10b981',
    '--danger': '#ef4444',
    '--info': '#8b5cf6',
    '--cursada': '#eab308',
    '--en-curso': '#a78bfa',
    '--selected': '#a78bfa',
    '--shadow-card': 'none',
    '--shadow-elevated': 'none',
  },
}

export function resolveTheme(theme: Theme): 'navy' | 'light' | 'dark' {
  if (theme !== 'auto') return theme
  if (typeof window === 'undefined') return 'navy'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'navy'
}

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'navy'
  return (localStorage.getItem('trayectai_theme') as Theme) ?? 'navy'
}

export function setTheme(theme: Theme) {
  localStorage.setItem('trayectai_theme', theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme)
  const vars = themes[resolved]
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    if (key.startsWith('--')) {
      root.style.setProperty(key, value as string)
    }
  })
}

export function getSystemThemeListener(callback: (isLight: boolean) => void) {
  const mq = window.matchMedia('(prefers-color-scheme: light)')
  const handler = (e: MediaQueryListEvent) => callback(e.matches)
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}