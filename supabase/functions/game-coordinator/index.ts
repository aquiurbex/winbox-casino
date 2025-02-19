
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
      let gameState = {
        crash: {
          status: 'waiting',
          multiplier: 1.00,
          startTime: Date.now() + 20000,
          crashPoint: 2.00
        },
        roulette: {
          status: 'waiting',
          lastResult: 0,
          nextSpinTime: Date.now() + 20000
        },
        wheel: {
          status: 'waiting',
          lastResult: 0,
          nextSpinTime: Date.now() + 20000
        }
      }

      setInterval(() => {
        const now = Date.now()

        // Update Crash game
        if (gameState.crash.status === 'waiting' && now >= gameState.crash.startTime) {
          gameState.crash.status = 'running'
          gameState.crash.startTime = now
        } else if (gameState.crash.status === 'running') {
          gameState.crash.multiplier += 0.01
          if (gameState.crash.multiplier >= gameState.crash.crashPoint) {
            gameState.crash.status = 'crashed'
            supabaseClient.from('game_history').insert([
              { game_type: 'crash', result: gameState.crash.multiplier }
            ])
          }
        } else if (gameState.crash.status === 'crashed' && now >= gameState.crash.startTime + 5000) {
          gameState.crash = {
            status: 'waiting',
            multiplier: 1.00,
            startTime: now + 20000,
            crashPoint: 1 + Math.random() * 10
          }
        }

        // Update Roulette game
        if (now >= gameState.roulette.nextSpinTime) {
          const result = Math.floor(Math.random() * 15) + 1
          supabaseClient.from('game_history').insert([
            { game_type: 'roulette', result }
          ])
          gameState.roulette = {
            status: 'waiting',
            lastResult: result,
            nextSpinTime: now + 20000
          }
        }

        // Update Wheel game
        if (now >= gameState.wheel.nextSpinTime) {
          const result = Math.floor(Math.random() * 50) + 1
          supabaseClient.from('game_history').insert([
            { game_type: 'wheel', result }
          ])
          gameState.wheel = {
            status: 'waiting',
            lastResult: result,
            nextSpinTime: now + 20000
          }
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
