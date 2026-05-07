import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { api } from '../api/client'
import { useUiStore } from '../uiStore'
import { useAuth } from '../contexts/AuthContext'
import { useGardenStore, type TaskType } from '../store'

type Message = {
  id: string
  from: 'bot' | 'user'
  text: string
}

type ChatHistoryEntry = {
  role: 'user' | 'assistant'
  content: string
}

type SystemMessage = {
  action: string
  data?: Record<string, unknown>
}

type Settings = {
  apiKey: string
  apiUrl: string
  systemContext: Record<string, unknown>
}

const DEFAULT_SYSTEM_CONTEXT = {
  instructions:
    'Du bist ein Gartenhelfer-KI. Wenn der Benutzer explizit eine der folgenden App-Aktionen wünscht, füge sie in system_messages ein.',
  available_actions: [
    { name: 'logout', description: 'Benutzer ausloggen' },
    {
      name: 'set_skill_level',
      description: 'App-Modus wechseln',
      params: { level: 'beginner | expert' },
    },
    { name: 'reset_ui', description: 'Alle UI-Einstellungen auf Standard zurücksetzen' },
    {
      name: 'add_plant',
      description: 'Neue Pflanze hinzufügen',
      params: { name: 'string', emoji: 'string', location: 'string', notes: 'string (optional)' },
    },
    {
      name: 'add_task',
      description: 'Neue Gartenaufgabe hinzufügen',
      params: {
        plantId: 'string (Pflanzen-ID aus dem Kontext)',
        title: 'string',
        taskType: 'watering | fertilizing | pruning | harvesting | repotting | other',
        dueDate: 'yyyy-MM-dd',
        notes: 'string (optional)',
      },
    },
  ],
}

async function loadSettingsFromApi(): Promise<Settings> {
  const s = await api
    .get<Record<string, { value: string }>>('/api/settings')
    .catch(() => ({}) as Record<string, { value: string }>)
  let systemContext: Record<string, unknown> = DEFAULT_SYSTEM_CONTEXT
  const raw = s['api.system_context']?.value
  if (raw) {
    try {
      systemContext = JSON.parse(raw) as Record<string, unknown>
    } catch {
      // use default
    }
  }
  return {
    apiKey: s['api.key']?.value ?? '',
    apiUrl: s['api.url']?.value ?? '',
    systemContext,
  }
}

async function loadUiElementsFromApi(): Promise<Record<string, string>> {
  const rows = await api
    .get<{ element_key: string; value: string }[]>('/api/ui/elements')
    .catch(() => [])
  return Object.fromEntries(rows.map((e) => [e.element_key, e.value]))
}

const DEFAULT_REPLIES = [
  'Das ist eine spannende Frage! 🤔 Leider weiß ich das noch nicht, aber ich lerne täglich dazu. Schau dich gerne in den Tabs um!',
  'Hmm, da bin ich überfragt! 🌱 Aber für Pflanzen, Aufgaben und Kalender bin ich dein Ansprechpartner!',
  'Interessant! 🌿 Gibt es etwas mit deinen Pflanzen oder Gartenaufgaben womit ich konkret helfen kann?',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function BotAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head */}
      <circle cx="20" cy="23" r="15" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
      {/* Leaves */}
      <ellipse cx="15" cy="9" rx="4.5" ry="7.5" fill="#16a34a" transform="rotate(-22 15 9)" />
      <ellipse cx="25" cy="8" rx="4.5" ry="7.5" fill="#22c55e" transform="rotate(22 25 8)" />
      <ellipse cx="20" cy="7" rx="4" ry="7" fill="#4ade80" />
      {/* Stem */}
      <line x1="20" y1="11" x2="20" y2="15" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="15" cy="23" r="2.5" fill="#15803d" />
      <circle cx="25" cy="23" r="2.5" fill="#15803d" />
      {/* Shine */}
      <circle cx="16" cy="22" r="0.8" fill="white" />
      <circle cx="26" cy="22" r="0.8" fill="white" />
      {/* Smile */}
      <path d="M14 29 Q20 34 26 29" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <circle cx="11" cy="27" r="3" fill="#fca5a5" opacity="0.35" />
      <circle cx="29" cy="27" r="3" fill="#fca5a5" opacity="0.35" />
    </svg>
  )
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { elements, setElementValue, setSkillLevel, init: initUi } = useUiStore()
  const { logout } = useAuth()
  const { addPlant, addTask, plants } = useGardenStore()
  const [messages, setMessages] = useState<Message[]>(() => {
    const greeting =
      useUiStore.getState().elements['text.chat.greeting'] ||
      'Hallo! 🌿 Wie kann ich dir heute helfen?'
    return [{ id: '0', from: 'bot', text: greeting }]
  })
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const botName = elements['text.chat.botName'] || 'Ivy · Garten-KI'
  const botStatus = elements['text.chat.botStatus'] || 'Online · immer für dich da'
  const inputPlaceholder = elements['text.chat.inputPlaceholder'] || 'Schreib mir etwas… 🌱'
  const tooltip = elements['text.chat.tooltip'] || 'Wie kann ich helfen? 🌿'

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isOpen, messages])

  async function handleSystemMessages(systemMessages: SystemMessage[]) {
    for (const msg of systemMessages) {
      try {
        switch (msg.action) {
          case 'logout':
            await logout()
            break
          case 'set_skill_level':
            if (msg.data?.level === 'beginner' || msg.data?.level === 'expert') {
              await setSkillLevel(msg.data.level as 'beginner' | 'expert')
            }
            break
          case 'reset_ui':
            await api.post('/api/ui/reset-to-default', {})
            await initUi()
            break
          case 'add_plant':
            if (msg.data) {
              await addPlant({
                name: String(msg.data.name ?? 'Neue Pflanze'),
                emoji: String(msg.data.emoji ?? '🌱'),
                location: String(msg.data.location ?? ''),
                notes: msg.data.notes ? String(msg.data.notes) : undefined,
              })
            }
            break
          case 'add_task':
            if (msg.data) {
              await addTask({
                plantId: String(msg.data.plantId ?? plants[0]?.id ?? ''),
                title: String(msg.data.title ?? 'Neue Aufgabe'),
                taskType: (msg.data.taskType as TaskType) ?? 'other',
                dueDate: String(msg.data.dueDate ?? new Date().toISOString().slice(0, 10)),
                notes: msg.data.notes ? String(msg.data.notes) : undefined,
              })
            }
            break
          default:
            console.warn(`Unbekannte System-Aktion: ${msg.action}`)
        }
      } catch (e) {
        console.error(`System-Aktion '${msg.action}' fehlgeschlagen:`, e)
      }
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const [{ apiUrl, apiKey, systemContext }, uiElements] = await Promise.all([
        loadSettingsFromApi(),
        loadUiElementsFromApi(),
      ])

      if (!apiUrl || !apiKey) {
        throw new Error('Missing API settings')
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          message: text,
          chat_history: chatHistory,
          ui_elements: uiElements,
          system_context: systemContext,
        }),
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`)
      }

      const rawReply = (await response.text()).trim()
      let replyText = rawReply || pick(DEFAULT_REPLIES)

      if (rawReply) {
        try {
          const parsed = JSON.parse(rawReply) as {
            message?: unknown
            updates?: Array<{ id?: unknown; new_value?: unknown }>
            system_messages?: Array<{ action?: unknown; data?: unknown }>
          }
          if (typeof parsed.message === 'string' && parsed.message.trim()) {
            replyText = parsed.message
          }

          if (Array.isArray(parsed.updates) && parsed.updates.length > 0) {
            await Promise.all(
              parsed.updates
                .filter(
                  (u): u is { id: string; new_value: string } =>
                    typeof u?.id === 'string' && typeof u?.new_value === 'string'
                )
                .map((u) => setElementValue(u.id, u.new_value))
            )
          }

          if (Array.isArray(parsed.system_messages) && parsed.system_messages.length > 0) {
            const validMsgs = parsed.system_messages.filter(
              (sm): sm is SystemMessage => typeof sm?.action === 'string'
            )
            await handleSystemMessages(validMsgs)
          }
        } catch {
          // keep plain text response
        }
      }

      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: replyText },
      ])
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, from: 'bot', text: replyText }])
    } catch (error) {
      console.error('Webhook call failed:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          from: 'bot',
          text: 'Entschuldige, ich konnte den Service gerade nicht erreichen. Bitte versuche es gleich noch einmal.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Chat flyout */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:bottom-8 sm:right-6 w-80 sm:w-96 chat-container rounded-3xl shadow-2xl border flex flex-col overflow-hidden z-[51]"
          style={{ maxHeight: 480, animation: 'chat-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div className="chat-header px-4 py-3.5 flex items-center gap-3 shrink-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                <BotAvatar size={36} />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  backgroundColor: 'var(--color-primary, #22c55e)',
                  borderColor: 'var(--color-secondary, #059669)',
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{botName}</p>
              <p className="text-green-200 text-xs flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse" />
                {botStatus}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-green-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages-area"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx('flex gap-2', msg.from === 'user' ? 'justify-end' : 'justify-start')}
                style={{ animation: 'msg-pop 0.22s ease-out' }}
              >
                {msg.from === 'bot' && (
                  <div className="w-7 h-7 shrink-0 mt-0.5 rounded-full chat-avatar-bg flex items-center justify-center">
                    <BotAvatar size={26} />
                  </div>
                )}
                <div
                  className={clsx(
                    'max-w-[76%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                    msg.from === 'bot'
                      ? 'chat-message-bot border rounded-tl-sm shadow-sm'
                      : 'chat-message-user rounded-tr-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center" style={{ animation: 'msg-pop 0.2s ease-out' }}>
                <div className="w-7 h-7 shrink-0 rounded-full chat-avatar-bg flex items-center justify-center">
                  <BotAvatar size={26} />
                </div>
                <div className="chat-message-bot border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 chat-typing-dot rounded-full block"
                        style={{ animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="px-4 py-3.5 border-t chat-input-area flex gap-2.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={inputPlaceholder}
              className="flex-1 text-sm px-3.5 py-2 rounded-xl border focus:outline-none chat-input transition-all"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                sendMessage()
              }}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 chat-send-btn disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 self-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-50">
        {/* Hover tooltip */}
        {isHovered && !isOpen && (
          <div
            className="absolute bottom-full right-0 mb-3 chat-tooltip rounded-2xl rounded-br-sm px-3.5 py-2 shadow-lg border text-sm font-medium whitespace-nowrap pointer-events-none"
            style={{ animation: 'chat-slide-up 0.18s ease-out' }}
          >
            {tooltip}
            <span className="absolute -bottom-1.5 right-4 w-3 h-3 chat-tooltip-caret border-r border-b rotate-45 block" />
          </div>
        )}

        <button
          onClick={() => setIsOpen((v) => !v)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Chat öffnen"
          className={clsx(
            'relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
            isOpen
              ? 'chat-fab-open scale-95 shadow-md'
              : 'chat-fab hover:scale-110 hover:shadow-xl'
          )}
          style={isOpen ? undefined : { animation: 'float 3s ease-in-out infinite' }}
        >
          {isOpen ? (
            <MessageCircle className="w-5 h-5 text-white" />
          ) : (
            <BotAvatar size={38} />
          )}

          {/* Sparkle badge */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </button>
      </div>
    </>
  )
}
