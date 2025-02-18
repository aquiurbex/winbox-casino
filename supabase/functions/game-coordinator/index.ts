
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GameState {
  crash: {
    status: 'waiting' | 'running' | 'crashed'
    multiplier: number
    startTime: number
    crashPoint: number
  }
  roulette: {
    status: 'waiting' | 'spinning' | 'complete'
    lastResult: number
    nextSpinTime: number
  }
  wheel: {
    status: 'waiting' | 'spinning' | 'complete'
    lastResult: number
    nextSpinTime: number
  }
}

let gameState: GameState = {
  crash: {
    status: 'waiting',
    multiplier: 1,
    startTime: Date.now(),
    crashPoint: generateCrashPoint()
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

function generateCrashPoint(): number {
  const e = Math.random()
  // House edge of 5%
  const houseEdge = 0.95
  const crashPoint = Math.max(1, (1 / (1 - e)) * houseEdge)
  // Cap at 1000x
  return Math.min(crashPoint, 1000)
}

async function updateGameHistory(gameType: 'crash' | 'roulette' | 'wheel', result: number) {
  await supabase
    .from('game_history')
    .insert([{
      game_type: gameType,
      result: result
    }])
}

const broadcasts = new Map<string, Response>()
const encoder = new TextEncoder()

function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  const encodedMessage = encoder.encode(message)
  broadcasts.forEach((response) => {
    try {
      response.body?.getWriter().write(encodedMessage)
    } catch (err) {
      console.error('Failed to write to stream:', err)
    }
  })
}

async function gameLoop() {
  while (true) {
    const now = Date.now()

    // Update Crash game
    if (gameState.crash.status === 'running') {
      const elapsed = (now - gameState.crash.startTime) / 1000
      gameState.crash.multiplier = 1 + Math.pow(elapsed, 1.2) / 4
      
      if (gameState.crash.multiplier >= gameState.crash.crashPoint) {
        gameState.crash.status = 'crashed'
        await updateGameHistory('crash', gameState.crash.multiplier)
        setTimeout(() => {
          gameState.crash = {
            status: 'waiting',
            multiplier: 1,
            startTime: Date.now() + 5000,
            crashPoint: generateCrashPoint()
          }
        }, 5000)
      }
    } else if (gameState.crash.status === 'waiting' && now >= gameState.crash.startTime) {
      gameState.crash.status = 'running'
    }

    // Update Roulette game
    if (gameState.roulette.status === 'waiting' && now >= gameState.roulette.nextSpinTime) {
      gameState.roulette.status = 'spinning'
      // Random number between 0-36
      const result = Math.floor(Math.random() * 37)
      await updateGameHistory('roulette', result)
      gameState.roulette = {
        status: 'complete',
        lastResult: result,
        nextSpinTime: now + 20000
      }
      setTimeout(() => {
        gameState.roulette.status = 'waiting'
      }, 5000)
    }

    // Update Wheel game
    if (gameState.wheel.status === 'waiting' && now >= gameState.wheel.nextSpinTime) {
      gameState.wheel.status = 'spinning'
      // Possible multipliers: 1.2, 2, 3, 5, 50
      const multipliers = [1.2, 1.2, 1.2, 2, 2, 2, 3, 3, 5, 50]
      const result = multipliers[Math.floor(Math.random() * multipliers.length)]
      await updateGameHistory('wheel', result)
      gameState.wheel = {
        status: 'complete',
        lastResult: result,
        nextSpinTime: now + 20000
      }
      setTimeout(() => {
        gameState.wheel.status = 'waiting'
      }, 5000)
    }

    broadcast(gameState)
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    
    if (url.pathname === '/game-state') {
      const id = crypto.randomUUID()
      const stream = new TransformStream()
      const response = new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
      
      broadcasts.set(id, response)
      
      if (broadcasts.size === 1) {
        gameLoop().catch(console.error)
      }
      
      response.body?.addEventListener('close', () => {
        broadcasts.delete(id)
      })
      
      return response
    }
    
    return new Response('Not found', { status: 404 })
  } catch (err) {
    console.error('Error:', err)
    return new Response(String(err?.message ?? 'Internal Server Error'), {
      status: 500,
      headers: corsHeaders
    })
  }
})
