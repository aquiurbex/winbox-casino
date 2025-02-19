
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Start EventSource stream
  const stream = new ReadableStream({
    start(controller) {
      let crashPoint = 2.00 // Initial crash point
      let multiplier = 1.00
      let startTime = Date.now()
      let status = 'waiting'

      setInterval(() => {
        const now = Date.now()
        const gameState = {
          crash: {
            status,
            multiplier,
            startTime,
            crashPoint
          },
          roulette: {
            status: 'waiting',
            lastResult: Math.floor(Math.random() * 15) + 1,
            nextSpinTime: now + 20000
          },
          wheel: {
            status: 'waiting',
            lastResult: Math.floor(Math.random() * 50) + 1,
            nextSpinTime: now + 20000
          }
        }

        // Update game state based on time
        if (status === 'waiting' && now >= startTime) {
          status = 'running'
          startTime = now
        } else if (status === 'running') {
          multiplier += 0.01
          if (multiplier >= crashPoint) {
            status = 'crashed'
            // Insert game result into history
            supabaseClient.from('game_history').insert([
              { game_type: 'crash', result: multiplier }
            ])
          }
        } else if (status === 'crashed' && now >= startTime + 5000) {
          status = 'waiting'
          startTime = now + 20000
          multiplier = 1.00
          crashPoint = 1 + Math.random() * 10 // Random crash point between 1x and 11x
        }

        controller.enqueue(`data: ${JSON.stringify(gameState)}\n\n`)
      }, 100)
    }
  })

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
})
