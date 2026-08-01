import React, { useEffect, useState, useRef } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { aiCoachService } from '../services/aiCoachService'
import { useAuth } from '../contexts/AuthContext'
import type { ChatMessage } from '../types'
import { MOCK_AI_INSIGHTS } from '../constants/mockData'
import { Emoji } from '../components/shared/Emoji'
import { BottomNav } from '../components/layout/BottomNav'
import { Send } from 'lucide-react'
import { ChatMessageSkeleton } from '../components/shared/Skeletons'

export function AICoachPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    aiCoachService.getHistory(user.id).then(data => {
      setMessages(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim()
    if (!text || !user || sending) return

    setInputText('')
    setSending(true)

    // Add user message optimistically
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      from_role: 'user',
      text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const aiReply = await aiCoachService.sendMessage(user.id, text, messages)
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, aiReply])
    } catch {
      // Fallback AI reply
      const fallbackReply: ChatMessage = {
        id: `fallback-${Date.now()}`,
        user_id: user.id,
        from_role: 'ai',
        text: 'Setiap langkah kecil menuju gaya hidup ramah lingkungan sangat berdampak! 🌿',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, fallbackReply])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between -mb-16">
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader
          title="Eco Coach AI 🤖"
          subtitle="Asisten pribadi untuk saran gaya hidup ramah lingkungan"
        />

        {/* AI Insights Carousel */}
        <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-none flex gap-3 shrink-0">
          {MOCK_AI_INSIGHTS.map(insight => (
            <div
              key={insight.id}
              onClick={() => handleSend(insight.text)}
              className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shrink-0 w-64 cursor-pointer hover:border-[var(--accent-primary)] transition-all shadow-xs flex items-start gap-2.5"
            >
              <Emoji size="lg">{insight.icon}</Emoji>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                {insight.text}
              </p>
            </div>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <ChatMessageSkeleton />
          ) : messages.length === 0 ? (
            <div className="p-8 text-center space-y-2 my-auto">
              <Emoji size="4xl">🌿</Emoji>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                Mulai percakapan dengan Eco Coach
              </h3>
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Tanyakan ide habit, tips hemat energi, atau cara mengurangi sampah plastik!
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.from_role === 'user'
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-default)]'
                    }`}
                  >
                    <Emoji size="sm">{isUser ? '👤' : '🤖'}</Emoji>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[var(--accent-primary)] text-white rounded-tr-none'
                        : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            })
          )}

          {sending && (
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] p-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
              Eco Coach sedang mengetik...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Tanya Eco Coach sesuatu..."
              aria-label="Tulis pesan untuk Eco Coach"
              className="flex-1 px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              aria-label="Kirim Pesan"
              className="w-11 h-11 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center hover:bg-[var(--accent-secondary)] transition-all shadow-md disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
