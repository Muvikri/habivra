import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const nativeFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init)
  const headers: Record<string, string> = {}
  request.headers.forEach((value, name) => { headers[name] = value })
  const text = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
  const response = await CapacitorHttp.request({
    url: request.url,
    method: request.method,
    headers,
    data: text ? JSON.parse(text) : undefined,
  })
  return new Response(typeof response.data === 'string' ? response.data : JSON.stringify(response.data), {
    status: response.status,
    headers: response.headers,
  })
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: Capacitor.isNativePlatform() ? nativeFetch : fetch,
  },
})
