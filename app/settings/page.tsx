'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { themes, type Theme, getTheme, setTheme, applyTheme, resolveTheme } from '@/lib/themes'
export default function SettingsPage() {
  const router = useRouter()
  const [current, setCurrent] = useState<Theme>('navy')

  useEffect(() => {
    const t = getTheme()
    setCurrent(t)
    applyTheme(t)
  }, [])

  function apply(t: Theme) {
    setTheme(t)
    applyTheme(t)
    setCurrent(t)
  }

  const getThemePreview = (key: Theme) => {
    const resolvedKey = key === 'auto' ? resolveTheme('auto') : key
    return themes[resolvedKey]
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '2rem var(--content-pad)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>

        <button onClick={() => router.back()} style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}>
          ← Volver
        </button>

        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, marginBottom: 4 }}>Apariencia</h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 28 }}>Elegí el tema que más te gusta</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          {(Object.keys(themes) as Theme[]).concat(['auto']).map(key => {
            const isAuto = key === 'auto'
            const resolved = isAuto ? resolveTheme(getTheme()) : key
            const t = isAuto ? themes[resolved] : themes[key]
            const bg = t['--bg']
            const bgCard = t['--bg-card']
            const border = t['--border']
            const accent = t['--accent']
            const accentText = t['--accent-text']
            const text = t['--text']
            const textMuted = t['--text-muted']
            const bgSubject = t['--bg-subject']
            const isActive = current === key

            return (
              <button
                key={key}
                onClick={() => apply(key as Theme)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
                  background: bgCard,
                  border: `2px solid ${isActive ? accent : border}`,
                  borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)',
                  cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
                  minHeight: 'var(--touch-min)',
                }}
              >
                <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, background: bg, border: `1px solid ${border}`, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, padding: 6 }}>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: bgCard, border: `1px solid ${border}` }}/>
                  <div style={{ width: '60%', height: 4, borderRadius: 2, background: accent }}/>
                  <div style={{ width: '100%', height: 4, borderRadius: 2, background: bgSubject, border: `1px solid ${border}` }}/>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--font-base)', fontWeight: 500, color: text }}>
                    {isAuto ? 'Automático' : t.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: textMuted, marginTop: 2 }}>
                    {key === 'auto' && `Sigue la preferencia del sistema (${resolved === 'light' ? 'claro' : 'oscuro'} ahora)`}
                    {key === 'navy' && 'Azul universitario oscuro'}
                    {key === 'light' && 'Blanco limpio con azul'}
                    {key === 'dark' && 'Oscuro estilo IDE con violeta'}
                  </div>
                </div>

                {isActive && (
                  <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: accent, color: accentText, whiteSpace: 'nowrap' }}>
                    Activo
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 32, padding: 'var(--card-pad)', borderRadius: 'var(--card-radius)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>
            El tema se aplica al instante en todas las pantallas. El modo automático cambia según la configuración de tu sistema operativo.
          </p>
        </div>

      </div>
    </div>
  )
}