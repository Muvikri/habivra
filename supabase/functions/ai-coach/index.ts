import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Keep this only in Supabase Edge Function secrets. Never use VITE_GROQ_API_KEY:
// every VITE_* variable is bundled into the browser application.
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_MODEL = Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile'
const MAX_MESSAGE_LENGTH = 2_000
const MAX_HISTORY_ITEMS = 10
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ChatHistoryItem = {
  from_role?: unknown
  text?: unknown
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const { message, history } = await req.json()

    if (!message || typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
      throw new Error('Request body must include a string message.')
    }

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured.')
      return new Response(JSON.stringify({ error: 'AI coach is not configured yet.' }), {
        status: 503,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const conversation = [
      {
        role: 'system',
        content:
          'You are Eco Coach, a friendly assistant that gives sustainable living tips, habit suggestions, and motivational support in Indonesian. Keep responses short, positive, and focused on eco-friendly habits.',
      },
      ...(Array.isArray(history)
        ? history
            .slice(-MAX_HISTORY_ITEMS)
            .filter((item: ChatHistoryItem) => typeof item?.text === 'string' && item.text.length <= MAX_MESSAGE_LENGTH)
            .map((item: ChatHistoryItem) => ({
              role: item.from_role === 'user' ? 'user' : 'assistant',
              content: item.text,
            }))
        : []),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: conversation,
        max_tokens: 250,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`Groq request failed: ${response.status} ${body}`)
      return new Response(JSON.stringify({ error: 'AI coach is temporarily unavailable.' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      throw new Error('Groq returned an empty reply.')
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('AI coach request failed:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
