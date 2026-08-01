import { supabase } from '../lib/supabase'
import { MOCK_CHAT_MESSAGES } from '../constants/mockData'
import type { ChatMessage } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const FALLBACK_REPLIES = [
  'Keren banget! Kamu sudah konsisten minggu ini. Terus pertahankan ya, bumi berterima kasih untukmu! 🌱',
  'Insight bagus! Berdasarkan pola habitmu, coba fokus dulu di satu kebiasaan utama sebelum menambah yang baru. 🌿',
  'Kalau kamu merasa satu habit berat, coba sederhanakan targetnya. Mulai dari 5 menit, bukan 1 jam! 💡',
  'Progress-mu meningkat 18% dibanding minggu lalu — itu bukan kebetulan, itu hasil kerja kerasmu! 💪',
  'Jangan khawatir kalau sesekali lupa. Yang penting konsistensi jangka panjang, bukan kesempurnaan harian. 🌍',
  'Habit yang paling berdampak untuk profilmu adalah mengurangi plastik sekali pakai. Yuk lanjutkan! ♻️',
]

let localChatMessages = [...MOCK_CHAT_MESSAGES]

export interface IAICoachService {
  getHistory(userId: string): Promise<ChatMessage[]>
  sendMessage(userId: string, userMessage: string, history: ChatMessage[]): Promise<ChatMessage>
}

class SupabaseAICoachService implements IAICoachService {
  async getHistory(userId: string): Promise<ChatMessage[]> {
    if (USE_MOCK) return localChatMessages
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50)
    if (error || !data || data.length === 0) return localChatMessages
    return data as ChatMessage[]
  }

  async sendMessage(userId: string, userMessage: string, history: ChatMessage[]): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      user_id: userId,
      from_role: 'user',
      text: userMessage,
      created_at: new Date().toISOString(),
    }

    if (USE_MOCK) {
      localChatMessages.push(userMsg)
      await new Promise(r => setTimeout(r, 600))
      const aiReplyText = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        user_id: userId,
        from_role: 'ai',
        text: aiReplyText,
        created_at: new Date().toISOString(),
      }
      localChatMessages.push(aiMsg)
      return aiMsg
    }

    // Supabase DB path
    await supabase.from('chat_messages').insert({
      user_id: userId,
      from_role: 'user',
      text: userMessage,
    })

    let aiText = ''
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('ai-coach', {
        body: { message: userMessage, history },
      })
      if (fnError) throw fnError
      aiText = fnData.reply
    } catch {
      await new Promise(r => setTimeout(r, 700))
      aiText = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
    }

    const { data: aiMsg, error: aiInsertError } = await supabase
      .from('chat_messages')
      .insert({ user_id: userId, from_role: 'ai', text: aiText })
      .select()
      .single()

    if (aiInsertError || !aiMsg) {
      const fallbackAiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        user_id: userId,
        from_role: 'ai',
        text: aiText,
        created_at: new Date().toISOString(),
      }
      localChatMessages.push(userMsg, fallbackAiMsg)
      return fallbackAiMsg
    }

    return aiMsg as ChatMessage
  }
}

export const aiCoachService: IAICoachService = new SupabaseAICoachService()
