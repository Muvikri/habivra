import { supabase } from "../lib/supabase"
import type { ChatConversation, ChatMessage } from "../types"

const USE_MOCK =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes("placeholder")

const FALLBACK_REPLIES = [
  "Keren banget! Kamu sudah konsisten minggu ini. Terus pertahankan ya, bumi berterima kasih untukmu! 🌱",
  "Insight bagus! Berdasarkan pola habitmu, coba fokus dulu di satu kebiasaan utama sebelum menambah yang baru. 🌿",
  "Kalau kamu merasa satu habit berat, coba sederhanakan targetnya. Mulai dari 5 menit, bukan 1 jam! 💡",
  "Progress-mu meningkat 18% dibanding minggu lalu — itu bukan kebetulan, itu hasil kerja kerasmu! 💪",
  "Jangan khawatir kalau sesekali lupa. Yang penting konsistensi jangka panjang, bukan kesempurnaan harian. 🌍",
]

let localConversations: ChatConversation[] = []
let localChatMessages: ChatMessage[] = []

type SupabaseResult<T> = {
  data: T | null
  error: { message?: string } | null
}

function hasExpiredJwt(error: { message?: string } | null) {
  return Boolean(error?.message && /jwt expired/i.test(error.message))
}

async function retryWithRefreshedSession<T>(
  request: () => Promise<SupabaseResult<T>>,
): Promise<SupabaseResult<T>> {
  const initial = await request()
  if (!hasExpiredJwt(initial.error)) return initial

  const { error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) {
    throw new Error("Sesi login sudah berakhir. Silakan masuk kembali.")
  }
  return request()
}

function createMockConversation(userId: string): ChatConversation {
  const conversation: ChatConversation = {
    id: `conversation-${Date.now()}`,
    user_id: userId,
    title: "Chat baru",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  localConversations = [conversation, ...localConversations]
  return conversation
}

function chatTitle(message: string) {
  return message.trim().replace(/\s+/g, " ").slice(0, 48) || "Chat baru"
}

export interface IAICoachService {
  getConversations(userId: string): Promise<ChatConversation[]>
  createConversation(userId: string): Promise<ChatConversation>
  deleteConversation(conversationId: string): Promise<void>
  getHistory(conversationId: string): Promise<ChatMessage[]>
  sendMessage(
    userId: string,
    conversation: ChatConversation,
    userMessage: string,
    history: ChatMessage[],
  ): Promise<ChatMessage>
}

class SupabaseAICoachService implements IAICoachService {
  async getConversations(userId: string): Promise<ChatConversation[]> {
    if (USE_MOCK) return localConversations.filter((item) => item.user_id === userId)
    const { data, error } = await retryWithRefreshedSession(() =>
      supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    )
    if (error) throw error
    return (data || []) as ChatConversation[]
  }

  async createConversation(userId: string): Promise<ChatConversation> {
    if (USE_MOCK) return createMockConversation(userId)
    const { data, error } = await retryWithRefreshedSession(() =>
      supabase
        .from("chat_conversations")
        .insert({ user_id: userId, title: "Chat baru" })
        .select()
        .single(),
    )
    if (error || !data) throw error || new Error("Chat baru tidak dapat dibuat")
    return data as ChatConversation
  }

  async deleteConversation(conversationId: string): Promise<void> {
    if (USE_MOCK) {
      localConversations = localConversations.filter((item) => item.id !== conversationId)
      localChatMessages = localChatMessages.filter(
        (item) => item.conversation_id !== conversationId,
      )
      return
    }
    const { error } = await retryWithRefreshedSession(() =>
      supabase.from("chat_conversations").delete().eq("id", conversationId),
    )
    if (error) throw error
  }

  async getHistory(conversationId: string): Promise<ChatMessage[]> {
    if (USE_MOCK) {
      return localChatMessages.filter((item) => item.conversation_id === conversationId)
    }
    const { data, error } = await retryWithRefreshedSession(() =>
      supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100),
    )
    if (error) throw error
    return (data || []) as ChatMessage[]
  }

  async sendMessage(
    userId: string,
    conversation: ChatConversation,
    userMessage: string,
    history: ChatMessage[],
  ): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      user_id: userId,
      conversation_id: conversation.id,
      from_role: "user",
      text: userMessage,
      created_at: new Date().toISOString(),
    }

    if (USE_MOCK) {
      localChatMessages.push(userMsg)
      await new Promise((resolve) => setTimeout(resolve, 600))
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        user_id: userId,
        conversation_id: conversation.id,
        from_role: "ai",
        text: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
        created_at: new Date().toISOString(),
      }
      localChatMessages.push(aiMsg)
      const index = localConversations.findIndex((item) => item.id === conversation.id)
      if (index >= 0) {
        localConversations[index] = {
          ...localConversations[index],
          title: history.length === 0 ? chatTitle(userMessage) : conversation.title,
          updated_at: aiMsg.created_at,
        }
        localConversations = [...localConversations].sort((a, b) =>
          b.updated_at.localeCompare(a.updated_at),
        )
      }
      return aiMsg
    }

    const { error: userMessageError } = await retryWithRefreshedSession(() =>
      supabase.from("chat_messages").insert({
        user_id: userId,
        conversation_id: conversation.id,
        from_role: "user",
        text: userMessage,
      }),
    )
    if (userMessageError) throw userMessageError

    let aiText = ""
    try {
      const { data: fnData, error: fnError } = await retryWithRefreshedSession(() =>
        supabase.functions.invoke("ai-coach", {
          body: { message: userMessage, history },
        }),
      )
      if (fnError) throw fnError
      aiText = fnData.reply
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 700))
      aiText = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
    }

    const { data: aiMsg, error: aiInsertError } = await retryWithRefreshedSession(() =>
      supabase
        .from("chat_messages")
        .insert({
          user_id: userId,
          conversation_id: conversation.id,
          from_role: "ai",
          text: aiText,
        })
        .select()
        .single(),
    )
    if (aiInsertError || !aiMsg) {
      throw aiInsertError || new Error("Balasan AI tidak dapat disimpan")
    }

    const updates = {
      updated_at: new Date().toISOString(),
      ...(history.length === 0 ? { title: chatTitle(userMessage) } : {}),
    }
    const { error: conversationError } = await retryWithRefreshedSession(() =>
      supabase.from("chat_conversations").update(updates).eq("id", conversation.id),
    )
    if (conversationError) console.error("Failed to update chat title", conversationError)

    return aiMsg as ChatMessage
  }
}

export const aiCoachService: IAICoachService = new SupabaseAICoachService()
