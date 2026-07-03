'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

type Alert = {
  id: string
  type: 'opening_soon' | 'open_now' | 'closing_soon' | 'closed' | 'exam_today'
  severity: 'info' | 'warning' | 'danger'
  title: string
  description: string
  examId: string
  subjectName: string
  examDate: string
  daysRemaining: number
}

type AlertsResponse = {
  alerts: Alert[]
  total: number
  hasUrgent: boolean
}

const SEVERITY_CONFIG = {
  danger: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', dot: '#ef4444', label: 'Urgente' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', dot: '#f59e0b', label: 'Pronto' },
  info: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', dot: '#3b82f6', label: 'Información' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysLabel(n: number) {
  if (n === 0) return 'hoy'
  if (n === 1) return 'mañana'
  return `en ${n} días`
}

export default function AlertsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const careerId = user?.careerId

  const { data, isLoading } = useQuery<AlertsResponse>({
    queryKey: ['alerts', careerId],
    queryFn: () => fetch(`/api/alerts?careerId=${careerId}`).then(r => r.json()),
    enabled: !!careerId,
  })

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-base)' }}>Cargando...</p>
    </div>
  )

  const alerts = data?.alerts ?? []
  const urgent = alerts.filter(a => a.severity === 'danger')
  const upcoming = alerts.filter(a => a.severity === 'warning')
  const info = alerts.filter(a => a.severity === 'info')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '2rem var(--content-pad) 1rem' }}>
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 4 }}>Alertas de inscripción</h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>
          Notificaciones sobre inscripciones a exámenes y fechas importantes
        </p>

        {isLoading && (
          <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)' }}>Cargando alertas...</p>
        )}

        {!isLoading && alerts.length === 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)', margin: 0 }}>
              No hay alertas activas. Todo está al día.
            </p>
          </div>
        )}

        {urgent.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#ef4444', marginBottom: 'var(--gap-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {urgent.length} urgente{urgent.length > 1 ? 's' : ''}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {urgent.map(a => (
                <div
                  key={a.id}
                  onClick={() => router.push('/calendario')}
                  style={{
                    background: SEVERITY_CONFIG.danger.bg,
                    border: `1px solid ${SEVERITY_CONFIG.danger.border}`,
                    borderRadius: 14, padding: 'var(--card-pad)', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_CONFIG.danger.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#ef4444' }}>{a.title}</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text)', margin: 0, marginLeft: 18 }}>{a.description}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '4px 0 0 18' }}>
                    {a.subjectName} · {formatDate(a.examDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#f59e0b', marginBottom: 'var(--gap-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Próximos eventos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {upcoming.map(a => (
                <div
                  key={a.id}
                  onClick={() => router.push('/calendario')}
                  style={{
                    background: SEVERITY_CONFIG.warning.bg,
                    border: `1px solid ${SEVERITY_CONFIG.warning.border}`,
                    borderRadius: 14, padding: 'var(--card-pad)', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_CONFIG.warning.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#f59e0b' }}>{a.title}</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text)', margin: 0, marginLeft: 18 }}>{a.description}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '4px 0 0 18' }}>
                    {a.subjectName} · {formatDate(a.examDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {info.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#3b82f6', marginBottom: 'var(--gap-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Información
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {info.map(a => (
                <div
                  key={a.id}
                  onClick={() => router.push('/calendario')}
                  style={{
                    background: SEVERITY_CONFIG.info.bg,
                    border: `1px solid ${SEVERITY_CONFIG.info.border}`,
                    borderRadius: 14, padding: 'var(--card-pad)', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_CONFIG.info.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#3b82f6' }}>{a.title}</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text)', margin: 0, marginLeft: 18 }}>{a.description}</p>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '4px 0 0 18' }}>
                    {a.subjectName} · {formatDate(a.examDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
