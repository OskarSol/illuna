import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { db } from '../db'

type Message = {
  id: string
  from: 'bot' | 'user'
  text: string
}


type Settings = {
  apiKey: string
  apiUrl: string
}

async function loadSettingsFromDb(): Promise<Settings> {
  const [apiKey, apiUrl] = await Promise.all([
    db.app_settings.get('api.key'),
    db.app_settings.get('api.url'),
  ])
  return {
    apiKey: apiKey?.value ?? '',
    apiUrl: apiUrl?.value ?? '',
  }
}

async function loadUiElementsFromDb() {
  const active = await db.ui_profiles.where('isActive').equals(1).first()
  const profileId = active?.id ?? 'default'
  const elements = await db.ui_elements.where('profileId').equals(profileId).toArray()
  return Object.fromEntries(elements.map((element) => [element.elementKey, element.value]))
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
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', from: 'bot', text: 'Hallo! 🌿 Wie kann ich dir heute helfen?' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isOpen, messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const [{ apiUrl, apiKey }, uiElements] = await Promise.all([
        loadSettingsFromDb(),
        loadUiElementsFromDb(),
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
          ui_elements: uiElements,
        }),
      })

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`)
      }

      const replyText = (await response.text()).trim() || pick(DEFAULT_REPLIES)
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
          className="fixed bottom-24 right-4 sm:bottom-8 sm:right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-green-100 flex flex-col overflow-hidden z-50"
          style={{ maxHeight: 480, animation: 'chat-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3.5 flex items-center gap-3 shrink-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                <BotAvatar size={36} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-300 rounded-full border-2 border-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Ivy · Garten-KI</p>
              <p className="text-green-200 text-xs flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse" />
                Online · immer für dich da
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
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-green-50/40 to-white"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx('flex gap-2', msg.from === 'user' ? 'justify-end' : 'justify-start')}
                style={{ animation: 'msg-pop 0.22s ease-out' }}
              >
                {msg.from === 'bot' && (
                  <div className="w-7 h-7 shrink-0 mt-0.5 rounded-full bg-green-100 flex items-center justify-center">
                    <BotAvatar size={26} />
                  </div>
                )}
                <div
                  className={clsx(
                    'max-w-[76%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                    msg.from === 'bot'
                      ? 'bg-white border border-green-100 text-green-900 rounded-tl-sm shadow-sm'
                      : 'bg-green-600 text-white rounded-tr-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center" style={{ animation: 'msg-pop 0.2s ease-out' }}>
                <div className="w-7 h-7 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                  <BotAvatar size={26} />
                </div>
                <div className="bg-white border border-green-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-green-400 rounded-full block"
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
          <div className="p-3 border-t border-green-100 bg-white flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Schreib mir etwas… 🌱"
              className="flex-1 text-sm px-3.5 py-2 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400 bg-green-50/30 placeholder-green-300 text-green-900 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-50">
        {/* Hover tooltip */}
        {isHovered && !isOpen && (
          <div
            className="absolute bottom-full right-0 mb-3 bg-white rounded-2xl rounded-br-sm px-3.5 py-2 shadow-lg border border-green-100 text-sm text-green-800 font-medium whitespace-nowrap pointer-events-none"
            style={{ animation: 'chat-slide-up 0.18s ease-out' }}
          >
            Wie kann ich helfen? 🌿
            <span className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white border-r border-b border-green-100 rotate-45 block" />
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
              ? 'bg-green-700 scale-95 shadow-md'
              : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-110 hover:shadow-xl hover:shadow-green-300/40'
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
