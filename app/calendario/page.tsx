'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'

type Exam = {
  id: string
  subjectId: string
  subjectName: string
  subjectCode: string | null
  examType: 'parcial' | 'final' | 'integrador' | 'recuperatorio'
  examDate: string
  startTime: string | null
  endTime: string | null
  location: string | null
  callNumber: number | null
  notes: string | null
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  parcial: 'Parcial',
  final: 'Final',
  integrador: 'Integrador',
  recuperatorio: 'Recuperatorio',
}

const EXAM_TYPE_COLORS: Record<string, string> = {
  parcial: '#3b82f6',
  final: '#ef4444',
  integrador: '#8b5cf6',
  recuperatorio: '#f59e0b',
}

function getMonthName(month: number) {
  const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return names[month]
}

function groupByMonth(exams: Exam[]) {
  const groups: { year: number; month: number; label: string; exams: Exam[] }[] = []
  for (const exam of exams) {
    const d = new Date(exam.examDate)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    let group = groups.find(g => `${g.year}-${g.month}` === key)
    if (!group) {
      group = { year: d.getFullYear(), month: d.getMonth(), label: `${getMonthName(d.getMonth())} ${d.getFullYear()}`, exams: [] }
      groups.push(group)
    }
    group.exams.push(exam)
  }
  return groups
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', weekday: 'short' })
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date(new Date().toDateString())
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const careerId = user?.careerId

  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ['exams', careerId],
    queryFn: () => fetch(`/api/exams?careerId=${careerId}`).then(r => r.json()),
    enabled: !!careerId,
  })

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-base)' }}>Cargando...</p>
    </div>
  )

  const groups = exams ? groupByMonth(exams) : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '2rem var(--content-pad) 1rem' }}>
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 4 }}>Calendario académico</h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>
          Mesas de examen y fechas importantes
        </p>

        {isLoading && (
          <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)' }}>Cargando exámenes...</p>
        )}

        {!isLoading && exams && exams.length === 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-muted)', margin: 0 }}>
              No hay exámenes cargados para tu carrera todavía.
            </p>
          </div>
        )}

        {groups.map(group => {
          const isMonthPast = group.exams.every(e => isPast(e.examDate))
          const monthTotal = group.exams.length
          const pastCount = group.exams.filter(e => isPast(e.examDate)).length

          return (
            <div key={`${group.year}-${group.month}`} style={{ marginBottom: 28, opacity: isMonthPast ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 'var(--gap-md)' }}>
                <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 600, margin: 0, color: 'var(--accent)' }}>{group.label}</h2>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  {pastCount > 0 ? `${pastCount}/${monthTotal} pasados` : `${monthTotal} examen${monthTotal !== 1 ? 'es' : ''}`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
                {group.exams.map(exam => {
                  const past = isPast(exam.examDate)
                  return (
                    <div
                      key={exam.id}
                      style={{
                        display: 'flex', gap: 'var(--gap-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 14, padding: 'var(--card-pad)',
                        opacity: past ? 0.6 : 1,
                      }}
                    >
                      <div style={{
                        width: 4, borderRadius: 999,
                        background: EXAM_TYPE_COLORS[exam.examType],
                        flexShrink: 0, minHeight: 48, alignSelf: 'stretch',
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>
                          {exam.subjectName}
                        </div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 3 }}>
                          {exam.subjectCode && <span>{exam.subjectCode} · </span>}
                          <span style={{
                            color: EXAM_TYPE_COLORS[exam.examType],
                            fontWeight: 600,
                          }}>
                            {EXAM_TYPE_LABELS[exam.examType]}
                          </span>
                          {exam.callNumber && <span> · {exam.callNumber}° llamado</span>}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-md)', marginTop: 8, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          <span>📅 {formatDate(exam.examDate)}</span>
                          {exam.startTime && <span>🕐 {exam.startTime}{exam.endTime ? ` - ${exam.endTime}` : ''}</span>}
                          {exam.location && <span>📍 {exam.location}</span>}
                        </div>

                        {exam.notes && (
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                            {exam.notes}
                          </div>
                        )}

                        {past && (
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 6 }}>
                            ✓ Este examen ya pasó
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
