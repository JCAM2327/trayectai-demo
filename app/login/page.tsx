'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--content-pad)' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--accent)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>TrayectAI</p>
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: '0 0 4px' }}>Iniciar sesión</h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 28 }}>Ingresá con tu email y contraseña</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
              required
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 'var(--font-base)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••"
              required
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 'var(--font-base)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ fontSize: 'var(--font-xs)', color: '#ef4444', marginBottom: 12 }}>{error}</p>}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 14, padding: 'var(--card-pad)', fontSize: 'var(--font-base)', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.4 : 1, marginBottom: 12, minHeight: 'var(--touch-min)' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <span style={{ background: 'var(--bg)', padding: '0 12px', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', position: 'relative', top: -9 }}>o probá sin registrarte</span>
            </div>
          </div>

          <button
            onClick={async () => {
              setLoading(true); setError('');
              try {
                await login('demo@trayectai.com', 'demo1234')
              } catch (err: any) {
                setError(err.message)
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            style={{ width: '100%', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '2px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: 'var(--card-pad)', fontSize: 'var(--font-base)', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.4 : 1, marginBottom: 16, minHeight: 'var(--touch-min)' }}
          >
            🚀 Probar con cuenta demo
          </button>
        </form>

        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
          ¿No tenés cuenta?{' '}
          <button onClick={() => router.push('/onboarding')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 'var(--font-sm)', padding: 0, textDecoration: 'underline' }}>
            Registrarse
          </button>
        </p>
      </div>
    </div>
  )
}
