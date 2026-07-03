'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { getRecommendedSubjects, computeGraduationProjection } from '@/lib/prerequisite-engine'
import type { Prerequisite as EnginePrerequisite, SubjectProgress } from '@/lib/prerequisite-engine'
import { useAuth } from '@/lib/auth-context'
import { CopilotFloating } from '@/components/ui/academic-chat'
import type { ChatContext } from '@/lib/chat-engine'
import { computeGamification } from '@/lib/gamification'
import { AchievementsPanel } from '@/components/ui/achievements-panel'

type Alert = {
  id: string
  type: string
  severity: 'info' | 'warning' | 'danger'
  title: string
  description: string
}

type Subject = {
  subjectId: string
  subjectName: string
  subjectCode: string
  yearNumber: number
  semester: number | null
  isAnnual: boolean
  credits: number
  isFinalThesis: boolean
  state: string
  grade: number | null
  missingPrerequisites: { requiredSubjectName: string }[]
}

type Prerequisite = { subjectId: string; requiredSubjectId: string; prerequisiteType: string }
type UserProgress = { subjectId: string; status: string; grade: number | null; passedAt: string | null; regularizedAt: string | null }

type CareerProgress = {
  subjects: Subject[]
  totalSubjects: number
  approvedSubjects: number
  enabledSubjects: number
  blockedSubjects: number
  totalCredits: number
  earnedCredits: number
  progressPercent: number
  averageGrade: number | null
  estimatedSemestersLeft: number
  prerequisites: Prerequisite[]
  userProgress: UserProgress[]
}

type Career = {
  id: string
  name: string
  shortName: string
  totalYears: number
  faculty: { name: string; shortName: string }
}

function Skeleton() {
  const sk = { animation: 'skeleton-pulse 1.8s ease-in-out infinite' }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '2.5rem var(--content-pad)' }}>
        <div style={{ width: 100, height: 12, borderRadius: 999, background: 'var(--border)', opacity: 0.3, marginBottom: 8, ...sk }} />
        <div style={{ width: 160, height: 24, borderRadius: 999, background: 'var(--border)', opacity: 0.2, marginBottom: 4, ...sk, animationDelay: '0.1s' }} />
        <div style={{ width: 200, height: 12, borderRadius: 999, background: 'var(--border)', opacity: 0.15, marginBottom: 28, ...sk, animationDelay: '0.2s' }} />
        <div style={{ height: 120, borderRadius: 'var(--card-radius)', background: 'var(--border)', opacity: 0.1, marginBottom: 'var(--gap-md)', ...sk, animationDelay: '0.3s' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)', marginBottom: 'var(--gap-md)' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 'var(--card-radius)', background: 'var(--border)', opacity: 0.08, ...sk, animationDelay: `${0.4 + i * 0.1}s` }} />
          ))}
        </div>
        <div style={{ height: 100, borderRadius: 'var(--card-radius)', background: 'var(--border)', opacity: 0.08, marginBottom: 'var(--gap-md)', ...sk, animationDelay: '0.8s' }} />
        <div style={{ height: 200, borderRadius: 'var(--card-radius)', background: 'var(--border)', opacity: 0.08, ...sk, animationDelay: '0.9s' }} />
      </div>
    </div>
  )
}

function CollapsibleSection({ title, subtitle, defaultOpen = true, children }: { title: string; subtitle?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', marginBottom: 'var(--gap-md)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: 'var(--card-pad)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left', color: 'var(--text)', minHeight: 'var(--touch-min)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {open && <div style={{ padding: `0 var(--card-pad) var(--card-pad)` }}>{children}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const userId = user?.id ?? null
  const careerId = user?.careerId ?? null

  const { data: progress, isLoading: progressLoading } = useQuery<CareerProgress>({
    queryKey: ['dashboard', careerId, userId],
    queryFn: () => fetch(`/api/careers/${careerId}/subjects?userId=${userId}`).then(r => r.json()),
    enabled: !!careerId && !!userId,
  })

  const { data: careers } = useQuery<Career[]>({
    queryKey: ['careers'],
    queryFn: async () => {
      const data = await fetch('/api/careers').then(r => r.json())
      return Array.isArray(data) ? data : []
    },
  })

  const career = careers?.find(c => c.id === careerId)

  const { data: alertsData } = useQuery<{ alerts: Alert[] }>({
    queryKey: ['alerts-summary', careerId],
    queryFn: () => fetch(`/api/alerts?careerId=${careerId}`).then(r => r.json()),
    enabled: !!careerId,
  })

  const urgentAlerts = alertsData?.alerts?.filter(a => a.severity === 'danger').slice(0, 3) ?? []
  const warningAlerts = alertsData?.alerts?.filter(a => a.severity === 'warning').slice(0, 3) ?? []
  const infoAlerts = alertsData?.alerts?.filter(a => a.severity === 'info').slice(0, 3) ?? []

  const recommendations = useMemo(() => {
    if (!progress) return []
    const careerSubjects = progress.subjects.map(s => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      yearNumber: s.yearNumber,
      semester: s.semester,
      isAnnual: s.isAnnual,
      credits: s.credits,
      isFinalThesis: s.isFinalThesis,
    }))
    return getRecommendedSubjects(
      careerSubjects,
      progress.prerequisites as EnginePrerequisite[],
      progress.userProgress as SubjectProgress[]
    )
  }, [progress])

  const graduationProjection = useMemo(() => {
    if (!progress || !user?.careerTotalYears) return null
    return computeGraduationProjection(
      progress.subjects.map(s => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        yearNumber: s.yearNumber,
        semester: s.semester,
        isAnnual: s.isAnnual,
        credits: s.credits,
        isFinalThesis: s.isFinalThesis,
      })),
      progress.prerequisites as EnginePrerequisite[],
      progress.userProgress as SubjectProgress[],
      user.careerTotalYears
    )
  }, [progress, user?.careerTotalYears])

  const gamification = useMemo(() => {
    if (!progress) return null
    const hasPlan = typeof window !== 'undefined'
      ? !!localStorage.getItem(`trayectai_plan_${user?.careerId ?? ''}`)
      : false
    return computeGamification(
      progress.subjects.map(s => ({
        state: s.state, credits: s.credits, subjectName: s.subjectName,
        semester: s.semester, yearNumber: s.yearNumber,
      })),
      progress.averageGrade,
      progress.totalCredits,
      progress.earnedCredits,
      progress.totalSubjects,
      progress.approvedSubjects,
      progress.enabledSubjects,
      graduationProjection?.isOnTrack ?? false,
      hasPlan,
    )
  }, [progress, graduationProjection, user?.careerId])

  const chatContext: ChatContext | null = useMemo(() => {
    if (!progress) return null
    return {
      subjects: progress.subjects,
      prerequisites: progress.prerequisites,
      userProgress: progress.userProgress.map(up => ({
        subjectId: up.subjectId,
        status: up.status,
        grade: up.grade ?? null,
        passedAt: up.passedAt ?? null,
        regularizedAt: up.regularizedAt ?? null,
      })),
      averageGrade: progress.averageGrade,
      careerTotalYears: user?.careerTotalYears ?? 5,
      careerName: career?.name ?? undefined,
    } as ChatContext
  }, [progress, user, career])

  if (loading || (progressLoading && !progress)) return <Skeleton />
  if (!userId || !careerId) return null

  const pct = progress?.progressPercent ?? 0
  const approved = progress?.approvedSubjects ?? 0
  const total = progress?.totalSubjects ?? 0
  const credits = progress?.earnedCredits ?? 0
  const totalCredits = progress?.totalCredits ?? 0
  const enabled = progress?.enabledSubjects ?? 0
  const blocked = progress?.blockedSubjects ?? 0
  const avgGrade = progress?.averageGrade
  const semestersLeft = progress?.estimatedSemestersLeft ?? 0
  const totalAlerts = alertsData?.alerts?.length ?? 0

  const subjectsLabel = (n: number) => `${n} materia${n !== 1 ? 's' : ''}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '2.5rem var(--content-pad) 2rem' }}>

        <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--accent)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>TrayectAI</p>
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Tu progreso</h1>
        {career && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 28 }}>{career.name} · {career.faculty.shortName} · {career.totalYears} años</p>}

        {/* Alertas activas */}
        {(urgentAlerts.length > 0 || warningAlerts.length > 0 || infoAlerts.length > 0) && (
          <div style={{ marginBottom: 'var(--gap-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentAlerts.map(a => (
              <div
                key={a.id}
                onClick={() => router.push('/alertas')}
                style={{
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 14, padding: '12px 14px', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14 }}>🔴</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{a.title}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text)', margin: '0 0 0 22px' }}>{a.description}</p>
              </div>
            ))}
            {warningAlerts.map(a => (
              <div
                key={a.id}
                onClick={() => router.push('/alertas')}
                style={{
                  background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 14, padding: '12px 14px', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 14 }}>🟡</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>{a.title}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text)', margin: '0 0 0 22px' }}>{a.description}</p>
              </div>
            ))}
            {infoAlerts.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 4 }}>
                +{infoAlerts.length} alerta{infoAlerts.length > 1 ? 's' : ''} informativa{infoAlerts.length > 1 ? 's' : ''}
              </div>
            )}
            {totalAlerts > (urgentAlerts.length + warningAlerts.length + infoAlerts.length) && (
              <div
                onClick={() => router.push('/alertas')}
                style={{ fontSize: 12, color: 'var(--accent)', textAlign: 'center', cursor: 'pointer', padding: 4 }}
              >
                Ver todas las {totalAlerts} alertas →
              </div>
            )}
          </div>
        )}

        {/* Banner progreso */}
        <div style={{ background: `linear-gradient(to right, var(--banner-from), var(--banner-to))`, border: '1px solid var(--border-accent)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginBottom: 'var(--gap-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--gap-md)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-hero)', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>de la carrera completado</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--accent)' }}>{approved}/{total}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>materias aprobadas</div>
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--progress-bg)', borderRadius: 999 }}>
            <div style={{ width: `${pct}%`, height: 8, background: 'var(--accent)', borderRadius: 999, transition: 'width 0.5s ease' }}/>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--gap-md)', marginBottom: 'var(--gap-md)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)' }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: '#10b981' }}>{credits}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>créditos ganados</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', opacity: 0.6 }}>de {totalCredits} totales</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)' }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--accent)' }}>{enabled}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>podés cursar ahora</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', opacity: 0.6 }}>materias habilitadas</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)' }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: avgGrade != null && avgGrade >= 7 ? '#10b981' : '#f59e0b' }}>
              {avgGrade != null ? avgGrade : '—'}
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>promedio general</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', opacity: 0.6 }}>
              {avgGrade != null ? `sobre ${approved} ${subjectsLabel(approved)}` : 'sin notas'}
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)' }}>
            <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: '#8b5cf6' }}>{semestersLeft}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>cuatrimestres restantes</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', opacity: 0.6 }}>estimado según tu ritmo</div>
          </div>
        </div>

        {/* Proyección de egreso */}
        {graduationProjection && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginBottom: 'var(--gap-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--gap-md)', marginBottom: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🎓</span>
              <div>
                <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: '#10b981', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proyección de egreso</p>
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text)', margin: '2px 0 0' }}>
                  {graduationProjection.estimatedDate}
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: 8 }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text)' }}>{graduationProjection.remainingSubjects}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>materias restantes</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: 8 }}>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text)' }}>{graduationProjection.subjectsPerSemester}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>materias / cuatrimestre</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              {graduationProjection.isOnTrack
                ? '✅ Vas a buen ritmo'
                : '⚠️ Necesitás acelerar el ritmo para egresar en el tiempo teórico'}
            </div>
          </div>
        )}

        {/* Recomendación inteligente */}
        {recommendations.length > 0 && (
          <CollapsibleSection title="Próximos pasos" subtitle="Materias recomendadas, ordenadas por impacto" defaultOpen={true}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {recommendations.slice(0, 5).map(r => (
                <div
                  key={r.subjectId}
                  onClick={() => router.push('/plan')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
                    transition: 'opacity 0.15s', minHeight: 'var(--touch-min)',
                  }}
                >
                  <div style={{ width: 4, minHeight: 32, height: '70%', borderRadius: 999, background: '#f59e0b', flexShrink: 0, alignSelf: 'stretch' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.subjectName}
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                      {r.subjectCode} · {r.credits} créditos
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {r.unlocksCount > 0 ? (
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>
                        +{r.unlocksCount} materia{r.unlocksCount > 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>sin impacto</div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.6, marginTop: 1 }}>
                      se desbloquean
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {!progress && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', textAlign: 'center', marginBottom: 'var(--gap-md)' }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>
              No hay datos de progreso todavía. Empezá marcando materias en tu plan de estudios.
            </p>
          </div>
        )}

        {/* Gamificación */}
        {gamification && progress && (
          <CollapsibleSection title="Salud académica y logros" defaultOpen={false}>
            <AchievementsPanel gamification={gamification} />
          </CollapsibleSection>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)', marginBottom: 'var(--gap-md)' }}>
          <button
            onClick={() => router.push('/plan')}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)',
              padding: 'var(--card-pad)', cursor: 'pointer', textAlign: 'center', minHeight: 'var(--touch-min)',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>📚</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>Plan de estudios</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Ver materias</div>
          </button>
          <button
            onClick={() => router.push('/calendario')}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)',
              padding: 'var(--card-pad)', cursor: 'pointer', textAlign: 'center', minHeight: 'var(--touch-min)',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>📅</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>Calendario</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Exámenes y fechas</div>
          </button>
        </div>

      </div>

      {/* Copilot FAB */}
      {chatContext && <CopilotFloating context={chatContext} />}
    </div>
  )
}
