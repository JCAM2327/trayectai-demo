'use client'

import { useState } from 'react'
import type { GamificationState, Achievement } from '@/lib/gamification'

interface AchievementsPanelProps {
  gamification: GamificationState
}

function HealthGauge({ score, color, label }: { score: number; color: string; label: string }) {
  const r = 48
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Índice de salud: ${score} - ${label}`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="60" y="48" textAnchor="middle" fontSize="28" fontWeight="700" fill="var(--text)">
          {score}
        </text>
        <text x="60" y="66" textAnchor="middle" fontSize="10" fill={color} fontWeight="600">
          {label}
        </text>
      </svg>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [expanded, setExpanded] = useState(false)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setExpanded(!expanded)
    }
  }

  const isUnlocked = achievement.unlocked

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${achievement.name}${isUnlocked ? ' - desbloqueado' : ' - bloqueado'}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10, minHeight: 44,
        background: isUnlocked ? 'rgba(16,185,129,0.06)' : 'var(--bg-subject)',
        border: `1px solid ${isUnlocked ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
        opacity: isUnlocked ? 1 : 0.5,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = isUnlocked ? 'rgba(16,185,129,0.1)' : 'var(--bg-card)' }}
      onMouseLeave={e => { e.currentTarget.style.background = isUnlocked ? 'rgba(16,185,129,0.06)' : 'var(--bg-subject)' }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{isUnlocked ? achievement.icon : '🔒'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: isUnlocked ? 'var(--success)' : 'var(--text-muted)' }}>
          {achievement.name}
        </div>
        {expanded && (
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            {achievement.description}
          </div>
        )}
        {achievement.progressMax && (
          <div style={{ marginTop: 4, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: isUnlocked ? 'var(--success)' : 'var(--text-muted)',
              width: `${Math.min((achievement.progress ?? 0) / achievement.progressMax * 100, 100)}%`,
              transition: 'width 0.4s',
            }} />
          </div>
        )}
      </div>
      {isUnlocked && <span style={{ fontSize: 12, color: 'var(--success)', flexShrink: 0 }}>✓</span>}
    </div>
  )
}

export function AchievementsPanel({ gamification }: AchievementsPanelProps) {
  const { healthIndex, streak, achievements } = gamification
  const unlocked = achievements.filter(a => a.unlocked).length
  const total = achievements.length
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll ? achievements : achievements.slice(0, 4)

  return (
    <div>
      {/* Health Index */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)',
        marginBottom: 'var(--gap-md)', textAlign: 'center',
      }}>
        <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Índice de salud académica
        </p>
        <HealthGauge score={healthIndex.score} color={healthIndex.color} label={healthIndex.label} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
          {healthIndex.breakdown.map(b => (
            <div key={b.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text)' }}>{b.score}/{b.max}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{b.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 12, padding: '8px 10px', borderRadius: 8,
          background: `${healthIndex.color}15`, border: `1px solid ${healthIndex.color}30`,
          fontSize: 'var(--font-xs)', color: 'var(--text)', lineHeight: 1.5,
        }}>
          {healthIndex.recommendation}
        </div>
      </div>

      {/* Streak */}
      <div style={{
        background: streak > 0 ? 'rgba(245,158,11,0.08)' : 'var(--bg-card)',
        border: `1px solid ${streak > 0 ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`,
        borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)',
        marginBottom: 'var(--gap-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 44,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>
              {streak > 0 ? `${streak} cuatrimestre${streak !== 1 ? 's' : ''} sin materias libres` : 'Sin racha activa'}
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 1 }}>
              {streak > 0 ? '¡Seguí así!' : 'Aprobá materias sin dejar libres para arrancar una racha'}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)', padding: 'var(--card-pad)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Logros {unlocked}/{total}
          </p>
          <span style={{ fontSize: 'var(--font-xs)', color: unlocked === total ? 'var(--success)' : 'var(--text-muted)' }}>
            {unlocked === total ? '🎉 Completado' : `${Math.round((unlocked / total) * 100)}%`}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {displayed.map(a => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>

        {achievements.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              width: '100%', marginTop: 8, background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 8, padding: '10px 16px', minHeight: 44,
              fontSize: 'var(--font-xs)', cursor: 'pointer',
            }}
          >
            {showAll ? 'Mostrar menos' : `Ver todos (${achievements.length})`}
          </button>
        )}
      </div>
    </div>
  )
}
