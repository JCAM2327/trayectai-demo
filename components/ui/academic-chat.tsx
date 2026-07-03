'use client'

import { useState, useRef, useEffect } from 'react'
import { processChatMessage } from '@/lib/chat-engine'
import type { ChatContext } from '@/lib/chat-engine'

interface Message {
  role: 'user' | 'assistant'
  text: string
  suggestions?: string[]
}

function AssistantMessage({ text, suggestions, onSuggestion, isLast }: { text: string; suggestions?: string[]; onSuggestion: (s: string) => void; isLast: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  const accentBorder = 'color-mix(in srgb, var(--accent) 12%, transparent)'
  return (
    <div style={{ marginBottom: 12, animation: isLast ? 'chatFadeIn 0.25s ease-out' : undefined }}>
      <div style={{
        background: 'var(--bg-card)', border: `1px solid ${accentBorder}`,
        borderRadius: '14px 14px 14px 4px', padding: '10px 14px',
        fontSize: 'var(--font-xs)', color: 'var(--text)', lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={i} style={{ color: 'var(--accent)' }}>{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
        )}
      </div>
      {suggestions && suggestions.length > 0 && (
        <div role="group" aria-label="Sugerencias" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestion(s)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSuggestion(s) } }}
              style={{
                background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
                color: 'var(--accent)', borderRadius: 999, padding: '6px 12px',
                fontSize: 'var(--font-xs)', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'background 0.15s', minHeight: 36,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UserMessage({ text }: { text: string }) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        background: 'color-mix(in srgb, var(--info) 14%, transparent)',
        border: '1px solid color-mix(in srgb, var(--info) 20%, transparent)',
        borderRadius: '14px 14px 4px 14px', padding: '10px 14px',
        fontSize: 'var(--font-xs)', color: 'var(--text)', maxWidth: '88%',
      }}>
        {text}
      </div>
    </div>
  )
}

const STORAGE_KEY = 'trayectai_chat_history'

function loadMessages(): Message[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50)))
  } catch { /* quota exceeded */ }
}

export function AcademicChat({ context, onClose }: { context: ChatContext; onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadMessages()
    if (saved && saved.length > 0) return saved
    return [{
      role: 'assistant',
      text: '🤖 ¡Hola! Soy tu copiloto académico. Preguntame lo que quieras sobre tu carrera.',
      suggestions: ['¿Qué puedo cursar?', 'Recomendame materias', '¿Cuánto me falta?', '¿Cómo voy?'],
    }]
  })
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, error])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSend(text: string) {
    if (!text.trim() || isTyping) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setError(null)

    setTimeout(() => {
      try {
        const response = processChatMessage(text, context)
        const assistantMsg: Message = {
          role: 'assistant',
          text: response.text,
          suggestions: response.suggestions,
        }
        setMessages(prev => [...prev, assistantMsg])
      } catch {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: '⚠️ Ocurrió un error al procesar tu mensaje. Probá de nuevo con otra pregunta.',
          suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cómo voy?'],
        }])
      }
      setIsTyping(false)
    }, 400 + Math.random() * 600)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY)
    setMessages([{
      role: 'assistant',
      text: '🧹 Historial borrado. ¿En qué puedo ayudarte?',
      suggestions: ['¿Qué puedo cursar?', 'Recomendame', '¿Cómo voy?'],
    }])
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, transparent), color-mix(in srgb, var(--accent) 4%, transparent))',
        borderBottom: '1px solid var(--border)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, animation: 'chatPulse 2s ease-in-out infinite' }}>🤖</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Copiloto académico
          </p>
          <p style={{ fontSize: '9px', color: isTyping ? 'var(--accent)' : 'var(--text-muted)', margin: '1px 0 0', transition: 'color 0.2s' }}>
            {isTyping ? 'Escribiendo...' : 'Conectado'}
          </p>
        </div>
        {context.careerName && (
          <div style={{
            fontSize: '9px', color: 'var(--text-muted)',
            background: 'var(--bg-card)', padding: '3px 8px', borderRadius: 999,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120,
          }}>
            {context.careerName}
          </div>
        )}
        {messages.length > 1 && (
          <button
            onClick={clearHistory}
            aria-label="Limpiar historial"
            title="Limpiar historial"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer', padding: 8, borderRadius: 6,
              lineHeight: 1, minHeight: 36,
            }}
          >
            🗑
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar chat"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 16, cursor: 'pointer', padding: 8, borderRadius: 6,
              lineHeight: 1, minHeight: 36,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div role="log" aria-live="polite" aria-label="Mensajes del chat" style={{
        flex: 1, overflowY: 'auto', padding: '10px 12px',
        scrollBehavior: 'smooth',
      }}>
        {messages.map((msg, i) =>
          msg.role === 'assistant'
            ? <AssistantMessage key={i} text={msg.text} suggestions={msg.suggestions} onSuggestion={handleSend} isLast={i === messages.length - 1} />
            : <UserMessage key={i} text={msg.text} />
        )}
        {isTyping && (
          <div
            style={{ marginBottom: 12 }}
            role="status"
            aria-live="assertive"
            aria-label="El copiloto está escribiendo una respuesta"
          >
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
              borderRadius: '14px 14px 14px 4px', padding: '10px 14px',
              fontSize: 'var(--font-xs)', color: 'var(--text-muted)',
              display: 'inline-block',
            }}>
              <span style={{ animation: 'chatTyping 1.2s ease-in-out infinite' }}>▊</span>
            </div>
          </div>
        )}
        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)', textAlign: 'center', marginBottom: 8 }}>
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '10px 12px',
        display: 'flex', gap: 8, flexShrink: 0,
        background: 'var(--bg)',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder="Haceme una pregunta..."
          aria-label="Preguntale al copiloto"
          style={{
            flex: 1,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 999, padding: '8px 14px',
            fontSize: 'var(--font-xs)', color: 'var(--text)',
            outline: 'none', minHeight: 36, height: 36,
            transition: 'box-shadow 0.15s',
          }}
          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent)' }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
        />
        <button
          onClick={() => handleSend(input)}
          disabled={isTyping || !input.trim()}
          aria-label="Enviar mensaje"
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: isTyping || !input.trim() ? 'var(--bg-card)' : 'var(--accent)',
            border: 'none',
            color: isTyping || !input.trim() ? 'var(--text-muted)' : 'var(--accent-text)',
            fontSize: 16, fontWeight: 600,
            cursor: isTyping || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

export function CopilotFloating({ context }: { context: ChatContext }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          role="presentation"
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.3)',
            display: 'block',
          }}
        />
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 0, right: 0,
          zIndex: 999,
          width: 'min(380px, 100vw)',
          height: 'min(540px, 85vh)',
          borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
          boxShadow: 'var(--shadow-elevated)',
          overflow: 'hidden',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          animation: 'chatSlideUp 0.25s ease-out',
        }}>
          <AcademicChat context={context} onClose={() => setOpen(false)} />
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat copiloto'}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? 'var(--danger)' : 'var(--accent)',
          border: 'none',
          color: open ? 'white' : 'var(--accent-text)',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  )
}
