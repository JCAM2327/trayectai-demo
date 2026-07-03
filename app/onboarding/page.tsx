'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

type University = { id: string; name: string; shortName: string }
type Faculty = { id: string; name: string; shortName: string }
type Career = { id: string; name: string; shortName: string; totalYears: number }

export default function OnboardingPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [universityId, setUniversityId] = useState<string | null>(null)
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [careerId, setCareerId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: universities } = useQuery<University[]>({
    queryKey: ['universities'],
    queryFn: () => fetch('/api/universities').then(r => r.json()),
  })

  const { data: faculties } = useQuery<Faculty[]>({
    queryKey: ['faculties', universityId],
    queryFn: () => fetch('/api/faculties').then(r => r.json()),
    enabled: !!universityId,
  })

  const { data: careers } = useQuery<Career[]>({
    queryKey: ['careers', facultyId],
    queryFn: () => fetch(`/api/faculties/${facultyId}/careers`).then(r => r.json()),
    enabled: !!facultyId,
  })

  const selectedUniversity = universities?.find(u => u.id === universityId)
  const selectedFaculty = faculties?.find(f => f.id === facultyId)
  const selectedCareer = careers?.find(c => c.id === careerId)

  const handleRegister = async () => {
    if (!universityId || !facultyId || !careerId || !fullName || !email || !password) return
    setError('')
    setLoading(true)
    try {
      await register({ fullName, email, password, universityId, facultyId, careerId })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 32, paddingBottom: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: 6, width: 'clamp(20px, 8vw, 28px)', borderRadius: 999,
            background: i <= step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.2s'
          }}/>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 var(--content-pad)', maxWidth: 'var(--content-max)', margin: '0 auto', width: '100%' }}>

        {/* PASO 1 — Universidad */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 4 }}>¿En qué universidad estudiás?</h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>Seleccioná tu universidad</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {universities?.map(u => (
                <button key={u.id} onClick={() => { setUniversityId(u.id); setStep(2) }}
                  style={{ textAlign: 'left', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', cursor: 'pointer', minHeight: 'var(--touch-min)' }}
                >
                  <div style={{ fontSize: 'var(--font-base)', fontWeight: 500, color: 'var(--text)' }}>{u.name}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{u.shortName}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 — Facultad */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0, minHeight: 'var(--touch-min)' }}>← Volver</button>
            <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 4 }}>¿En qué facultad estudiás?</h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>{selectedUniversity?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {faculties?.map(f => (
                <button key={f.id} onClick={() => { setFacultyId(f.id); setCareerId(null); setStep(3) }}
                  style={{ textAlign: 'left', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', cursor: 'pointer', minHeight: 'var(--touch-min)' }}
                >
                  <div style={{ fontSize: 'var(--font-base)', fontWeight: 500, color: 'var(--text)' }}>{f.name}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{f.shortName}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3 — Carrera */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0, minHeight: 'var(--touch-min)' }}>← Volver</button>
            <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 4 }}>¿Qué carrera cursás?</h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>{selectedFaculty?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {careers?.length === 0 && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>No hay carreras cargadas para esta facultad.</p>}
              {careers?.map(c => (
                <button key={c.id} onClick={() => { setCareerId(c.id); setStep(4) }}
                  style={{ textAlign: 'left', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', cursor: 'pointer', minHeight: 'var(--touch-min)' }}
                >
                  <div style={{ fontSize: 'var(--font-base)', fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{c.totalYears} años · {c.shortName}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4 — Registro */}
        {step === 4 && (
          <div>
            <button onClick={() => setStep(3)} style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0, minHeight: 'var(--touch-min)' }}>← Volver</button>
            <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 4 }}>Creá tu cuenta</h1>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>{selectedCareer?.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nombre completo</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Tu nombre"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 'var(--font-base)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 'var(--font-base)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 'var(--font-base)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {error && <p style={{ fontSize: 'var(--font-xs)', color: '#ef4444', marginBottom: 12 }}>{error}</p>}

            <button
              onClick={handleRegister}
              disabled={!fullName || !email || !password || password.length < 6 || loading}
              style={{ width: '100%', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 14, padding: 'var(--card-pad)', fontSize: 'var(--font-base)', fontWeight: 600, cursor: 'pointer', opacity: (!fullName || !email || !password || password.length < 6 || loading) ? 0.4 : 1, minHeight: 'var(--touch-min)' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta y empezar'}
            </button>

            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
              ¿Ya tenés cuenta?{' '}
              <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 'var(--font-sm)', padding: 0, textDecoration: 'underline' }}>
                Iniciar sesión
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
