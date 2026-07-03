'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useRef, useEffect } from 'react'
import { simulateApproval, computeGraduationProjection } from '@/lib/prerequisite-engine'
import type { SimulationResult, SubjectProgress, Prerequisite, MissingPrereq } from '@/lib/prerequisite-engine'
import { useAuth } from '@/lib/auth-context'
import { SubjectGraph } from '@/components/ui/subject-graph'
import { SemesterPlanner } from '@/components/ui/semester-planner'
import { CopilotFloating } from '@/components/ui/academic-chat'
import type { ChatContext } from '@/lib/chat-engine'

type Subject = {
  subjectId: string
  subjectName: string
  subjectCode: string
  yearNumber: number
  semester: number | null
  isAnnual: boolean
  credits: number
  isFinalThesis: boolean
  state: 'aprobada' | 'regular' | 'cursada' | 'habilitada' | 'en_curso' | 'bloqueada'
  grade: number | null
  missingPrerequisites: MissingPrereq[]
}

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
  prerequisites?: Prerequisite[]
  userProgress?: SubjectProgress[]
}

const STATE_COLORS = {
  aprobada:  { bar: '#10b981', badge: '#10b981', badgeBg: 'rgba(16,185,129,0.15)', label: 'Aprobada' },
  regular:   { bar: '#3b82f6', badge: '#3b82f6', badgeBg: 'rgba(59,130,246,0.15)', label: 'Regular' },
  habilitada:{ bar: '#f59e0b', badge: '#f59e0b', badgeBg: 'rgba(245,158,11,0.15)', label: 'Podés cursar' },
  cursada:   { bar: '#eab308', badge: '#eab308', badgeBg: 'rgba(234,179,8,0.15)', label: 'Cursada' },
  en_curso:  { bar: '#8b5cf6', badge: '#8b5cf6', badgeBg: 'rgba(139,92,246,0.15)', label: 'En curso' },
  bloqueada: { bar: 'var(--border)', badge: 'var(--text-muted)', badgeBg: 'var(--bg)', label: 'Bloqueada' },
}

function Skeleton() {
  const sk = { animation: 'skeleton-pulse 1.8s ease-in-out infinite' }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px var(--content-pad)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ width: 140, height: 16, borderRadius: 999, background: 'var(--border)', opacity: 0.5, ...sk }} />
            <div style={{ width: 100, height: 11, borderRadius: 999, background: 'var(--border)', opacity: 0.3, ...sk, animationDelay: '0.1s' }} />
          </div>
          <div style={{ width: 80, height: 32, borderRadius: 999, background: 'var(--border)', opacity: 0.3, ...sk, animationDelay: '0.1s' }} />
        </div>
      </div>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--content-pad)' }}>
        <div style={{ height: 80, borderRadius: 'var(--card-radius)', background: 'var(--border)', opacity: 0.1, marginBottom: 'var(--gap-md)', ...sk, animationDelay: '0.2s' }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 70, height: 22, borderRadius: 999, background: 'var(--border)', opacity: 0.15, ...sk, animationDelay: `${0.3 + i * 0.3}s` }} />
              <div style={{ flex: 1, height: 1, background: 'var(--border)', opacity: 0.3, ...sk, animationDelay: `${0.3 + i * 0.3}s` }} />
            </div>
            {[1, 2].map(j => (
              <div key={j} style={{ marginBottom: 8 }}>
                <div style={{ width: 80, height: 10, borderRadius: 999, background: 'var(--border)', opacity: 0.15, marginBottom: 8, ...sk, animationDelay: `${0.4 + i * 0.3 + j * 0.1}s` }} />
                {[1, 2, 3].map(k => (
                  <div key={k} style={{ height: 52, borderRadius: 14, background: 'var(--border)', opacity: 0.08, marginBottom: 6, ...sk, animationDelay: `${0.5 + i * 0.3 + j * 0.1 + k * 0.05}s` }} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlanPage() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const USER_ID = user?.id ?? ''
  const CAREER_ID = user?.careerId ?? ''
  const [selected, setSelected] = useState<Subject | null>(null)
  const [gradeInput, setGradeInput] = useState('')
  const [simMode, setSimMode] = useState(false)
  const [simSelections, setSimSelections] = useState<Set<string>>(new Set())
  const [simResults, setSimResults] = useState<SimulationResult[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showGraduation, setShowGraduation] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('todas')
  const [graphMode, setGraphMode] = useState(false)
  const [plannerMode, setPlannerMode] = useState(false)
  const [graphSelectedId, setGraphSelectedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const { data, isLoading } = useQuery<CareerProgress>({
    queryKey: ['plan', CAREER_ID, USER_ID],
    queryFn: async () => {
      const res = await fetch(`/api/careers/${CAREER_ID}/subjects?userId=${USER_ID}`, { cache: 'no-cache' })
      return res.json()
    },
  })

  const markMutation = useMutation({
    mutationFn: async ({ subjectId, status, grade }: { subjectId: string; status: string; grade?: number }) => {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, careerId: CAREER_ID, subjectId, status, grade }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      return res.json()
    },
    onSuccess: async () => {
      setSelected(null)
      setGradeInput('')
      setErrorMsg('')
      await queryClient.invalidateQueries({ queryKey: ['plan', CAREER_ID, USER_ID] })
      await queryClient.refetchQueries({ queryKey: ['plan', CAREER_ID, USER_ID] })
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
    },
  })

  const unmarkMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const res = await fetch(
        `/api/progress?userId=${USER_ID}&careerId=${CAREER_ID}&subjectId=${subjectId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al desmarcar')
      }
      return res.json()
    },
    onSuccess: async () => {
      setSelected(null)
      setErrorMsg('')
      await queryClient.invalidateQueries({ queryKey: ['plan', CAREER_ID, USER_ID] })
      await queryClient.refetchQueries({ queryKey: ['plan', CAREER_ID, USER_ID] })
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
    },
  })

  const toggleSimSelection = (subjectId: string) => {
    setSimResults(null)
    setSimSelections(prev => {
      const next = new Set(prev)
      if (next.has(subjectId)) next.delete(subjectId)
      else next.add(subjectId)
      return next
    })
  }

  const handleSimulate = () => {
    if (!data) return
    const careerSubjects = data.subjects.map(s => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      yearNumber: s.yearNumber,
      semester: s.semester,
      isAnnual: s.isAnnual,
      credits: s.credits,
      isFinalThesis: s.isFinalThesis,
    }))
    const result = simulateApproval(
      Array.from(simSelections),
      careerSubjects,
      data.prerequisites ?? [],
      data.userProgress ?? []
    )
    setSimResults(result)
  }

  const exitSimMode = () => {
    setSimMode(false)
    setSimSelections(new Set())
    setSimResults(null)
  }

  const newlyEnabledIds = useMemo(() => {
    if (!simResults) return new Set<string>()
    return new Set(simResults.flatMap(r => r.newlyEnabled.map(s => s.subjectId)))
  }, [simResults])

  const graduationProjection = useMemo(() => {
    if (!data || !user?.careerTotalYears) return null
    return computeGraduationProjection(
      data.subjects.map(s => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        yearNumber: s.yearNumber,
        semester: s.semester,
        isAnnual: s.isAnnual,
        credits: s.credits,
        isFinalThesis: s.isFinalThesis,
      })),
      data.prerequisites ?? [],
      data.userProgress ?? [],
      user.careerTotalYears
    )
  }, [data, user?.careerTotalYears])

  const filteredSubjects = useMemo(() => {
    if (!data) return []
    const q = searchQuery.toLowerCase().trim()

    return data.subjects.filter(s => {
      if (activeFilter === 'aprobada' && s.state !== 'aprobada') return false
      if (activeFilter === 'habilitada' && s.state !== 'habilitada') return false
      if (activeFilter === 'bloqueada' && s.state !== 'bloqueada') return false
      if (activeFilter === 'pendiente' && (s.state === 'aprobada')) return false

      if (!q) return true
      return (
        s.subjectName.toLowerCase().includes(q) ||
        s.subjectCode.toLowerCase().includes(q)
      )
    })
  }, [data, searchQuery, activeFilter])

  if (authLoading || !USER_ID || !CAREER_ID) return <Skeleton />
  if (isLoading) return <Skeleton />
  if (!data) return null

  const byYear = new Map<number, Subject[]>()
  for (const s of filteredSubjects) {
    if (!byYear.has(s.yearNumber)) byYear.set(s.yearNumber, [])
    byYear.get(s.yearNumber)!.push(s)
  }
  const years = Array.from(byYear.keys()).sort()
  const yearLabels: Record<number, string> = { 1:'1er Año', 2:'2do Año', 3:'3er Año', 4:'4to Año', 5:'5to Año' }

  const filterTabs = [
    { key: 'todas', label: `Todas (${data.subjects.length})` },
    { key: 'habilitada', label: `Habilitadas (${data.enabledSubjects})` },
    { key: 'aprobada', label: `Aprobadas (${data.approvedSubjects})` },
    { key: 'bloqueada', label: `Bloqueadas (${data.blockedSubjects})` },
  ]

  const chatContext: ChatContext = {
    subjects: data.subjects,
    prerequisites: data.prerequisites ?? [],
    userProgress: (data.userProgress ?? []).map(up => ({
      subjectId: up.subjectId,
      status: up.status,
      grade: up.grade ?? null,
      passedAt: up.passedAt ?? null,
      regularizedAt: up.regularizedAt ?? null,
    })),
    averageGrade: data.averageGrade ?? null,
    careerTotalYears: user?.careerTotalYears ?? 5,
    careerName: undefined,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '12px var(--content-pad)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-md)', marginBottom: 10 }}>
            <div>
              <h1 style={{ fontSize: 'var(--font-base)', fontWeight: 600, margin: 0, color: 'var(--text)' }}>Plan de Estudios</h1>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--accent)', margin: '2px 0 0' }}>{data.totalSubjects} materias · {data.totalCredits} créditos</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowGraduation(!showGraduation)}
                style={{
                  background: showGraduation ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${showGraduation ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)'}`,
                  color: '#10b981',
                  borderRadius: 999, padding: '6px 12px', fontSize: 'var(--font-xs)', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 'var(--touch-min)',
                }}
              >
                🎓 Egreso
              </button>
              <button
                onClick={() => {
                  setPlannerMode(false);
                  setGraphMode(false);
                  simMode ? exitSimMode() : setSimMode(true)
                }}
                style={{
                  background: simMode ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
                  border: `1px solid ${simMode ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}`,
                  color: simMode ? '#ef4444' : '#8b5cf6',
                  borderRadius: 999, padding: '6px 12px', fontSize: 'var(--font-xs)', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 'var(--touch-min)',
                }}
              >
                {simMode ? '✕ Salir' : '🧪 Simular'}
              </button>
              <button
                onClick={() => {
                  setPlannerMode(false);
                  setGraphMode(!graphMode);
                  if (graphMode) exitSimMode()
                }}
                style={{
                  background: graphMode ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.08)',
                  border: `1px solid ${graphMode ? 'rgba(139,92,246,0.4)' : 'rgba(59,130,246,0.2)'}`,
                  color: graphMode ? '#8b5cf6' : '#3b82f6',
                  borderRadius: 999, padding: '6px 12px', fontSize: 'var(--font-xs)', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 'var(--touch-min)',
                }}
              >
                {graphMode ? '✕ Vista gráfica' : '🔗 Vista gráfica'}
              </button>
              <button
                onClick={() => {
                  setPlannerMode(!plannerMode);
                  if (plannerMode) { setGraphMode(false); exitSimMode() }
                }}
                style={{
                  background: plannerMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${plannerMode ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.2)'}`,
                  color: plannerMode ? '#10b981' : '#10b981',
                  borderRadius: 999, padding: '6px 12px', fontSize: 'var(--font-xs)', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 'var(--touch-min)',
                }}
              >
                {plannerMode ? '✕ Planificador' : '📋 Planificador'}
              </button>
              {/* Copiloto moved to FAB */}
            </div>
          </div>

          {/* Search */}
          {!graphMode && !plannerMode && (
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>
                🔍
              </span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar materia por nombre o código... (Ctrl+F)"
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '10px 12px 10px 36px',
                  fontSize: 'var(--font-sm)',
                  color: 'var(--text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: 'var(--touch-min)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 4 }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Filter tabs */}
          {!graphMode && !plannerMode && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {filterTabs.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  background: activeFilter === f.key ? 'var(--accent)' : 'var(--bg-card)',
                  border: `1px solid ${activeFilter === f.key ? 'var(--accent)' : 'var(--border)'}`,
                  color: activeFilter === f.key ? 'var(--accent-text)' : 'var(--text-muted)',
                  borderRadius: 999, padding: '5px 12px',
                  fontSize: 'var(--font-xs)', fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--content-pad) var(--content-pad) 0' }}>

        {/* Banner resumen */}
        {!graphMode && !plannerMode && (
        <div style={{ background: `linear-gradient(to right, var(--banner-from), var(--banner-to))`, border: '1px solid var(--border-accent)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
          {[
            { val: data.approvedSubjects,      label: 'Aprobadas' },
            { val: data.enabledSubjects,       label: 'Habilitadas' },
            { val: `${data.progressPercent}%`, label: 'Completado' },
            { val: data.earnedCredits,         label: 'Créditos' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 700, color: 'white' }}>{s.val}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        )}

        {/* Proyección de egreso */}
        {showGraduation && graduationProjection && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginBottom: 'var(--gap-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--gap-md)', marginBottom: 12 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>🎓</span>
              <div>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#10b981', margin: 0 }}>
                  Fecha estimada de egreso
                </p>
                <p style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--text)', margin: '4px 0 0', lineHeight: 1.2 }}>
                  {graduationProjection.estimatedDate}
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text)' }}>{graduationProjection.remainingSubjects}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>materias restantes</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text)' }}>{graduationProjection.estimatedSemesters}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>cuatrimestres estimados</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text)' }}>{graduationProjection.subjectsPerSemester}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>materias / cuatrimestre</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: graduationProjection.isOnTrack ? '#10b981' : '#f59e0b' }}>
                  {graduationProjection.isOnTrack ? '✅ A tiempo' : '⚠️ Atrasado'}
                </div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  {graduationProjection.isOnTrack ? 'Ritmo adecuado' : 'Necesitás acelerar'}
                </div>
              </div>
            </div>
            {graduationProjection.subjectsBySemester.length > 0 && (
              <div style={{ marginTop: 'var(--gap-md)' }}>
                <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Proyección cuatrimestre a cuatrimestre
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {graduationProjection.subjectsBySemester.slice(0, 6).map((s, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 10, padding: '8px 10px' }}>
                      <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: '#10b981', marginBottom: 4 }}>
                        {s.semester === 1 ? '1er' : '2do'} cuatrimestre {s.year}
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                        {s.subjects.map(sj => sj.subjectName).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sin resultados de búsqueda */}
        {filteredSubjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 'var(--font-base)', margin: 0 }}>No se encontraron materias para "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('todas') }}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 'var(--font-sm)', cursor: 'pointer', marginTop: 8 }}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Planificador cuatrimestral */}
        {plannerMode ? (
          <SemesterPlanner
            subjects={data.subjects}
            prerequisites={data.prerequisites ?? []}
          />
        ) : graphMode ? (
          <>
            <div style={{ display: 'flex', gap: 'var(--gap-md)', overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--gap-md)', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              {Object.entries(STATE_COLORS).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.bar, flexShrink: 0 }}/>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{cfg.label}</span>
                </div>
              ))}
            </div>
            <SubjectGraph
              subjects={data.subjects}
              prerequisites={data.prerequisites ?? []}
              selectedSubjectId={graphSelectedId}
              onSubjectSelect={(id) => {
                setGraphSelectedId(id)
                if (id) {
                  const s = data.subjects.find(sub => sub.subjectId === id)
                  if (s && (s.state === 'habilitada' || s.state === 'aprobada' || s.state === 'regular' || s.state === 'en_curso')) {
                    setSelected(s)
                  }
                } else {
                  setSelected(null)
                }
              }}
            />
          </>
        ) : (
          <>
        {/* Leyenda */}
        <div style={{ display: 'flex', gap: 'var(--gap-md)', overflowX: 'auto', paddingBottom: 4, marginBottom: 8, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {Object.entries(STATE_COLORS).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.bar, flexShrink: 0 }}/>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Resultado de simulación */}
        {simResults && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', marginBottom: 'var(--gap-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
              <span style={{ fontSize: 'var(--font-lg)', flexShrink: 0 }}>🧪</span>
              <div>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#10b981', margin: 0 }}>
                  Si aprobás {simSelections.size} materia{simSelections.size > 1 ? 's' : ''}, se desbloquearía{newlyEnabledIds.size !== 1 ? 'n' : ''} {newlyEnabledIds.size} materia{newlyEnabledIds.size !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Las materias nuevas habilitadas aparecen resaltadas en verde. Las simuladas, en violeta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan por año */}
        {years.map(year => {
          const subjects = byYear.get(year)!
          const approved = subjects.filter(s => s.state === 'aprobada').length
          const allYearSubjects = data.subjects.filter(s => s.yearNumber === year)
          const totalInYear = allYearSubjects.length

          return (
            <div key={year} style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', marginBottom: 'var(--gap-md)' }}>
                <div style={{ background: 'var(--year-badge)', border: '1px solid var(--year-badge-border)', color: 'var(--year-badge-text)', fontSize: 'var(--font-xs)', fontWeight: 600, padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {yearLabels[year] ?? `${year}° Año`}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 4, width: Math.min(60, (totalInYear > 0 ? (approved / totalInYear) * 60 : 0)), borderRadius: 999, background: '#10b981', transition: 'width 0.3s' }} />
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{approved}/{subjects.length}</span>
                </div>
              </div>

              {[1, 2, null].map(sem => {
                const group = subjects.filter(s =>
                  sem === null ? s.isAnnual : s.semester === sem && !s.isAnnual
                )
                if (group.length === 0) return null

                return (
                  <div key={String(sem)} style={{ marginBottom: 'var(--gap-md)' }}>
                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--section-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      {sem === null ? 'Anual' : sem === 1 ? '1er cuatrimestre' : '2do cuatrimestre'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
                      {group.map(s => {
                        const cfg = STATE_COLORS[s.state]
                        const isBlocked = s.state === 'bloqueada'
                        const isSelected = simSelections.has(s.subjectId)
                        const isSimUnlocked = newlyEnabledIds.has(s.subjectId)

                        let clickable = s.state !== 'bloqueada'
                        let onClick = () => clickable && setSelected(s)
                        let borderColor = isBlocked ? 'var(--border)' : 'var(--border)'
                        let bgColor = isBlocked ? 'rgba(0,0,0,0.05)' : 'var(--bg-subject)'

                        if (simMode) {
                          if (s.state === 'habilitada') {
                            clickable = true
                            onClick = () => toggleSimSelection(s.subjectId)
                            if (isSelected) {
                              borderColor = '#8b5cf6'
                              bgColor = 'rgba(139,92,246,0.08)'
                            }
                          } else if (isSimUnlocked) {
                            borderColor = '#10b981'
                            bgColor = 'rgba(16,185,129,0.08)'
                          } else {
                            clickable = false
                          }
                        }

                        return (
                          <div
                            key={s.subjectId}
                            onClick={onClick}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 'var(--gap-md)',
                              background: bgColor,
                              border: `1px solid ${borderColor}`,
                              borderRadius: 14, padding: '10px 12px',
                              cursor: clickable ? 'pointer' : 'default',
                              opacity: (isBlocked && !isSimUnlocked) ? 0.5 : 1,
                              transition: 'opacity 0.15s, border-color 0.15s, background 0.15s',
                              minHeight: 'var(--touch-min)',
                            }}
                          >
                            <div style={{ width: 4, minHeight: 32, borderRadius: 999, background: cfg.bar, flexShrink: 0, alignSelf: 'stretch' }}/>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {simMode && isSelected && '✓ '}{s.subjectName}
                              </div>
                              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                                {s.subjectCode} · {s.credits} cr
                                {isBlocked && !isSimUnlocked && s.missingPrerequisites.length > 0 && (
                                  <span> · Requiere: {s.missingPrerequisites[0].requiredSubjectName}
                                    {s.missingPrerequisites.length > 1 && ` +${s.missingPrerequisites.length - 1}`}
                                  </span>
                                )}
                                {isSimUnlocked && (
                                  <span style={{ color: '#10b981', fontWeight: 600 }}> · 🔓 Se desbloquearía</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                              {s.grade && <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--accent)' }}>{s.grade}</span>}
                              <div style={{ fontSize: 'clamp(9px, 2vw, 10px)', fontWeight: 500, padding: '2px 8px', borderRadius: 999, background: isSimUnlocked ? 'rgba(16,185,129,0.15)' : cfg.badgeBg, color: isSimUnlocked ? '#10b981' : cfg.badge, border: `1px solid ${isSimUnlocked ? 'rgba(16,185,129,0.3)' : cfg.badge}33`, whiteSpace: 'nowrap' }}>
                                {isSimUnlocked ? '🔓 Se desbloquea' : cfg.label}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
        </>)}
      </div>

      {/* Simulación - barra inferior */}
      {simMode && simSelections.size === 0 && !simResults && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none', padding: 'var(--content-pad)' }}>
          <div style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', maxWidth: 440, width: '100%', pointerEvents: 'auto', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>
              Seleccioná las materias <strong style={{ color: '#f59e0b' }}>habilitadas</strong> que planeás aprobar para ver su impacto
            </p>
          </div>
        </div>
      )}

      {simMode && simSelections.size > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 40, padding: 'var(--content-pad)' }}>
          <div style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)', width: '100%', maxWidth: 440, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-md)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', flex: 1 }}>
              Simulando: <strong style={{ color: '#8b5cf6' }}>{simSelections.size}</strong> materia{simSelections.size > 1 ? 's' : ''}
              {simResults && (
                <span style={{ marginLeft: 8, color: '#10b981' }}>
                  · <strong>{newlyEnabledIds.size}</strong> se desbloquearía{newlyEnabledIds.size !== 1 ? 'n' : ''}
                </span>
              )}
            </span>
            {!simResults ? (
              <button
                onClick={handleSimulate}
                style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 'var(--font-sm)', fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)', whiteSpace: 'nowrap' }}
              >
                Calcular
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--gap-sm)' }}>
                <button
                  onClick={() => {
                    Array.from(simSelections).forEach(subjectId => {
                      markMutation.mutate({ subjectId, status: 'aprobada' })
                    })
                    exitSimMode()
                  }}
                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 'var(--font-xs)', fontWeight: 600, cursor: 'pointer', minHeight: 'var(--touch-min)', whiteSpace: 'nowrap' }}
                >
                  ✓ Aplicar
                </button>
                <button
                  onClick={() => { setSimSelections(new Set()); setSimResults(null) }}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '8px 16px', fontSize: 'var(--font-xs)', cursor: 'pointer', minHeight: 'var(--touch-min)', whiteSpace: 'nowrap' }}
                >
                  Nueva
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copilot FAB */}
      {chatContext && <CopilotFloating context={chatContext} />}

      {/* Modal (sheet desde abajo) */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 'var(--content-pad)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: '24px 24px 0 0', padding: 'var(--card-pad)', width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border)', margin: '0 auto 16px' }}/>
            <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>{selected.subjectName}</h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: '0 0 20px' }}>{selected.subjectCode} · {selected.credits} créditos</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nota (opcional)</label>
              <input
                type="number" min="1" max="10"
                value={gradeInput}
                onChange={e => setGradeInput(e.target.value)}
                placeholder="ej: 7"
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 'var(--font-base)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
              {errorMsg && (
                <p style={{ margin: 0, color: '#ef4444', fontSize: 'var(--font-sm)', textAlign: 'center' }}>{errorMsg}</p>
              )}
              {selected.state !== 'aprobada' && (
                <button
                  onClick={() => markMutation.mutate({ subjectId: selected.subjectId, status: 'aprobada', grade: gradeInput ? Number(gradeInput) : undefined })}
                  disabled={markMutation.isPending}
                  style={{ width: '100%', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 12, padding: '13px', fontSize: 'var(--font-base)', fontWeight: 600, cursor: 'pointer', opacity: markMutation.isPending ? 0.5 : 1, minHeight: 'var(--touch-min)' }}
                >
                  {markMutation.isPending ? 'Guardando...' : '✅ Marcar como aprobada'}
                </button>
              )}
              {selected.state !== 'regular' && selected.state !== 'aprobada' && (
                <button
                  onClick={() => markMutation.mutate({ subjectId: selected.subjectId, status: 'regular' })}
                  disabled={markMutation.isPending}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '12px', fontSize: 'var(--font-base)', cursor: 'pointer', minHeight: 'var(--touch-min)' }}
                >
                  📖 Marcar como regular
                </button>
              )}
              {(selected.state === 'aprobada' || selected.state === 'regular') && (
                <button
                  onClick={() => unmarkMutation.mutate(selected.subjectId)}
                  disabled={unmarkMutation.isPending}
                  style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 12, padding: '12px', fontSize: 'var(--font-base)', cursor: 'pointer', opacity: unmarkMutation.isPending ? 0.5 : 1, minHeight: 'var(--touch-min)' }}
                >
                  {unmarkMutation.isPending ? 'Desmarcando...' : '↩ Desmarcar'}
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 'var(--font-sm)', cursor: 'pointer', padding: '12px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}