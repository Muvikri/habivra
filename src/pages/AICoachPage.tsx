import React, { useCallback, useEffect, useRef, useState } from "react"
import { PageHeader } from "../components/layout/PageHeader"
import { aiCoachService } from "../services/aiCoachService"
import { useAuth } from "../contexts/AuthContext"
import type { ChatConversation, ChatMessage } from "../types"
import { MOCK_AI_INSIGHTS } from "../constants/mockData"
import { Emoji } from "../components/shared/Emoji"
import { BottomNav } from "../components/layout/BottomNav"
import { Bot, History, MessageCircle, Plus, Send, Trash2, X } from "lucide-react"
import { ChatMessageSkeleton } from "../components/shared/Skeletons"

function readableChatError(error: unknown) {
  const details = error as {
    code?: string
    message?: string
    details?: string
    hint?: string
  }
  if (details.code === "23503") {
    return "Profil akun belum tersimpan di server. Coba keluar lalu masuk kembali."
  }
  if (details.code === "42501") {
    return "Akun ini belum memiliki izin untuk menyimpan chat. Coba keluar lalu masuk kembali."
  }
  if (details.code === "PGRST204") {
    return "Struktur database chat belum sinkron. Jalankan migration database terbaru."
  }
  if (details.message && /jwt expired|sesi login sudah berakhir/i.test(details.message)) {
    return "Sesi login sudah berakhir. Silakan keluar lalu masuk kembali."
  }
  return details.message || "Terjadi gangguan saat menyimpan chat."
}

export function AICoachPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    if (!user) return []
    const data = await aiCoachService.getConversations(user.id)
    setConversations(data)
    return data
  }, [user])

  const openConversation = useCallback(async (conversation: ChatConversation) => {
    setActiveConversation(conversation)
    setLoading(true)
    setHistoryOpen(false)
    try {
      setMessages(await aiCoachService.getHistory(conversation.id))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let alive = true
    setLoading(true)
    void loadConversations()
      .then(async (data) => {
        if (alive && data[0]) await openConversation(data[0])
        else if (alive) {
          setMessages([])
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [loadConversations, openConversation, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  const createConversation = async () => {
    if (!user || sending) return null
    const conversation = await aiCoachService.createConversation(user.id)
    setConversations((previous) => [conversation, ...previous])
    setActiveConversation(conversation)
    setMessages([])
    setLoading(false)
    setHistoryOpen(false)
    return conversation
  }

  const handleDeleteConversation = async (conversation: ChatConversation) => {
    if (sending) return
    if (!window.confirm(`Hapus chat “${conversation.title}”? Pesan di dalamnya tidak dapat dikembalikan.`)) {
      return
    }
    try {
      await aiCoachService.deleteConversation(conversation.id)
      const remaining = conversations.filter((item) => item.id !== conversation.id)
      setConversations(remaining)
      if (activeConversation?.id === conversation.id) {
        if (remaining[0]) await openConversation(remaining[0])
        else {
          setActiveConversation(null)
          setMessages([])
          setLoading(false)
          setHistoryOpen(false)
        }
      }
    } catch {
      window.alert("Chat belum dapat dihapus. Coba lagi.")
    }
  }

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText.trim()
    if (!text || !user || sending) return

    setInputText("")
    setSending(true)
    setChatError(null)
    let conversation = activeConversation
    try {
      if (!conversation) conversation = await createConversation()
      if (!conversation) return

      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        conversation_id: conversation.id,
        from_role: "user",
        text,
        created_at: new Date().toISOString(),
      }
      setMessages((previous) => [...previous, tempUserMsg])

      const aiReply = await aiCoachService.sendMessage(
        user.id,
        conversation,
        text,
        messages,
      )
      setMessages((previous) => [
        ...previous.filter((message) => message.id !== tempUserMsg.id),
        tempUserMsg,
        aiReply,
      ])
      const updated = await loadConversations()
      const refreshedConversation = updated.find((item) => item.id === conversation.id)
      if (refreshedConversation) setActiveConversation(refreshedConversation)
    } catch (error) {
      console.error("AI chat error", error)
      setInputText(text)
      setChatError(readableChatError(error))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader
          title="Eco Coach"
          subtitle={activeConversation?.title || "Mulai percakapan baru"}
          rightElement={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void createConversation()}
                aria-label="Chat baru"
                className="flex size-10 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--accent-primary)]"
              >
                <Plus className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                aria-label="Riwayat chat"
                className="flex size-10 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--accent-muted)] text-[var(--accent-primary)]"
              >
                <History className="size-5" />
              </button>
            </div>
          }
        />

        <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-none flex gap-3 shrink-0">
          {MOCK_AI_INSIGHTS.map((insight) => (
            <button
              type="button"
              key={insight.id}
              onClick={() => void handleSend(insight.text)}
              className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] shrink-0 w-64 text-left hover:border-[var(--accent-primary)] transition-all shadow-xs flex items-start gap-2.5"
            >
              <Emoji size="lg">{insight.icon}</Emoji>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                {insight.text}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-4 pb-28">
          {loading ? (
            <ChatMessageSkeleton />
          ) : messages.length === 0 ? (
            <div className="m-auto w-full max-w-sm rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                <Emoji size="3xl">🌿</Emoji>
              </div>
              <h3 className="text-sm font-black text-[var(--text-primary)]">
                Mulai percakapan dengan Eco Coach
              </h3>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-[var(--text-muted)]">
                Setiap chat memiliki konteksnya sendiri. Tanyakan ide habit, tips hemat energi, atau cara mengurangi sampah plastik.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
              const isUser = message.from_role === "user"
              return (
                <div
                  key={message.id}
                  className={`flex gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isUser ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-secondary)] border border-[var(--border-default)]"}`}>
                    <Emoji size="sm">{isUser ? "👤" : "🤖"}</Emoji>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${isUser ? "bg-[var(--accent-primary)] text-white rounded-tr-none" : "bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-none"}`}>
                    {message.text}
                  </div>
                </div>
              )
              })}
            </div>
          )}

          {sending && (
            <div className="mt-3 flex items-center gap-2 p-2 text-xs font-bold text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
              Eco Coach sedang mengetik...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 mx-auto w-full max-w-md border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 p-3 backdrop-blur-md">
          {chatError && (
            <div role="alert" className="mb-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold leading-snug text-red-500">
              {chatError}
            </div>
          )}
          <form onSubmit={(event) => { event.preventDefault(); void handleSend() }} className="flex items-center gap-2">
            <input type="text" value={inputText} onChange={(event) => setInputText(event.target.value)} placeholder="Tanya Eco Coach sesuatu..." aria-label="Tulis pesan untuk Eco Coach" className="flex-1 px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] placeholder:text-[var(--text-muted)] shadow-sm" />
            <button type="submit" disabled={!inputText.trim() || sending} aria-label="Kirim Pesan" className="w-11 h-11 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center hover:bg-[var(--accent-secondary)] transition-all shadow-md active:scale-95 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label="Riwayat chat">
          <div className="max-h-[78vh] w-full max-w-md rounded-t-3xl border-x border-t border-[var(--border-default)] bg-[var(--bg-primary)] p-5 shadow-2xl sm:rounded-3xl sm:border">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--text-primary)]"><MessageCircle className="size-5 text-[var(--accent-primary)]" /><h2 className="text-base font-black">Riwayat chat</h2></div>
              <button type="button" aria-label="Tutup riwayat" onClick={() => setHistoryOpen(false)} className="rounded-xl p-2 text-[var(--text-muted)]"><X className="size-5" /></button>
            </div>
            <button type="button" onClick={() => void createConversation()} className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent-primary)] px-4 py-3 text-xs font-black text-white"><Plus className="size-4" />Chat baru</button>
            <div className="max-h-[52vh] space-y-2 overflow-y-auto">
              {conversations.length === 0 ? <p className="p-4 text-center text-xs font-semibold text-[var(--text-muted)]">Belum ada chat tersimpan.</p> : conversations.map((conversation) => (
                <div key={conversation.id} className={`flex items-center gap-2 rounded-2xl border p-3 ${activeConversation?.id === conversation.id ? "border-[var(--accent-primary)] bg-[var(--accent-muted)]" : "border-[var(--border-default)] bg-[var(--bg-card)]"}`}>
                  <button type="button" onClick={() => void openConversation(conversation)} className="min-w-0 flex-1 text-left"><p className="truncate text-xs font-black text-[var(--text-primary)]">{conversation.title}</p><p className="mt-0.5 text-[10px] font-semibold text-[var(--text-muted)]">{new Date(conversation.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p></button>
                  <button type="button" onClick={() => void handleDeleteConversation(conversation)} aria-label={`Hapus ${conversation.title}`} className="rounded-xl p-2 text-red-500"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
