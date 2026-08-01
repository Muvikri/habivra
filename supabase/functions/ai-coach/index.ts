import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { message } = await req.json()

    // Stub fallback AI responses for eco coach
    const fallbacks = [
      'Bagus sekali! Terus pertahankan kebiasaan hijaumu. 🌿',
      'Setiap tindakan kecilmu membuat perbedaan nyata bagi bumi! 🌍',
      'Konsistensi adalah kunci. Kamu sudah di jalur yang sangat tepat! 🌱',
      'Progress-mu luar biasa! Yuk lanjutkan tantangan berikutnya. 💪',
    ]

    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)]

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
