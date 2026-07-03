'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getTheme, setTheme, applyTheme } from '@/lib/themes'
import type { Theme } from '@/lib/themes'

const THEME_CYCLE: Theme[] = ['navy', 'light', 'dark', 'auto']
const THEME_ICONS: Record<Theme, string> = { navy: '🌊', light: '☀️', dark: '🌙', auto: '🖥️' }
const THEME_LABELS: Record<Theme, string> = { navy: 'Oscuro', light: 'Claro', dark: 'Dark IDE', auto: 'Automático' }

export function Navbar() {
  const router = useRouter()
  const path = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [theme, setCurrentTheme] = useState<Theme>('navy')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentTheme(getTheme())
  }, [])

  function cycleTheme() {
    const idx = THEME_CYCLE.indexOf(theme)
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
    setTheme(next)
    applyTheme(next)
    setCurrentTheme(next)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (path === '/onboarding' || path === '/login') return null

  const items = [
    { label: 'Inicio', icon: '🏠', href: '/' },
    { label: 'Plan de estudios', icon: '📚', href: '/plan' },
    { label: 'Calendario', icon: '📅', href: '/calendario' },
    { label: 'Alertas', icon: '🔔', href: '/alertas' },
  ]

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    router.push('/login')
  }

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: 'clamp(8px, 2vw, 12px)', right: 'clamp(8px, 2vw, 12px)', zIndex: 200 }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        style={{
          width: 'var(--touch-min)', height: 'var(--touch-min)', borderRadius: 12,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontSize: 20, lineHeight: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)' }}
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', top: 'clamp(56px, 10vw, 60px)',
            right: 'clamp(8px, 2vw, 12px)',
            left: 'clamp(8px, 2vw, 12px)',
            maxWidth: 320,
            width: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            marginLeft: 'auto',
          }}
        >
          {user && (
            <div style={{ padding: 'var(--card-pad)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text)' }}>{user.fullName}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
            </div>
          )}

          <div style={{ padding: 8 }}>
            {items.map(item => {
              const active = path === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '10px 12px',
                    background: active ? 'var(--bg)' : 'none',
                    border: 'none', borderRadius: 10,
                    color: active ? 'var(--accent)' : 'var(--text)',
                    fontSize: 'var(--font-base)', fontWeight: active ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                    minHeight: 'var(--touch-min)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
            <button
              onClick={cycleTheme}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px',
                background: 'none', border: 'none', borderRadius: 10,
                color: 'var(--accent)', fontSize: 'var(--font-base)', fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.1s',
                minHeight: 'var(--touch-min)',
              }}
            >
              <span style={{ fontSize: 18 }}>{THEME_ICONS[theme]}</span>
              {THEME_LABELS[theme]}
            </button>
            <button
              onClick={() => navigate('/settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px',
                background: path === '/settings' ? 'var(--bg)' : 'none',
                border: 'none', borderRadius: 10,
                color: path === '/settings' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 'var(--font-xs)', fontWeight: 400,
                cursor: 'pointer', textAlign: 'left',
                minHeight: 36,
              }}
            >
              <span style={{ fontSize: 14 }}>🎨</span>
              Configuración de temas
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', padding: 8 }}>
            <button
              onClick={() => { setOpen(false); logout(); router.push('/onboarding') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px',
                background: 'none', border: 'none', borderRadius: 10,
                color: 'var(--text)', fontSize: 'var(--font-base)', fontWeight: 400,
                cursor: 'pointer', textAlign: 'left',
                minHeight: 'var(--touch-min)',
              }}
            >
              <span style={{ fontSize: 18 }}>🔄</span>
              Cambiar de carrera
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px',
                background: 'none', border: 'none', borderRadius: 10,
                color: '#ef4444', fontSize: 'var(--font-base)', fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
                opacity: loggingOut ? 0.5 : 1,
                minHeight: 'var(--touch-min)',
              }}
            >
              <span style={{ fontSize: 18 }}>🚪</span>
              {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
