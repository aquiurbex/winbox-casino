
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    players: any[]
    nextGameTime: number
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

// Initialize game state
let gameState: GameState = {
  crash: {
    status: 'waiting',
    multiplier: 1,
    startTime: Date.now() + 20000,  // Start in 20 seconds
    crashPoint: generateCrashPoint(),
    players: [],
    nextGameTime: Date.now() + 20000
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
  // This generates a random crash point between 1 and 10
  return 1 + Math.random() * 9;
}

function updateCrashGame() {
  const now = Date.now()

  // If waiting and it's time to start
  if (gameState.crash.status === 'waiting' && now >= gameState.crash.nextGameTime) {
    gameState.crash.status = 'running'
    gameState.crash.multiplier = 1
    gameState.crash.startTime = now
    gameState.crash.players = [] // Reset players for new round
  }
  // If running, increase multiplier
  else if (gameState.crash.status === 'running') {
    const elapsed = (now - gameState.crash.startTime) / 1000 // seconds
    gameState.crash.multiplier = Math.pow(Math.E, 0.1 * elapsed)
    
    // Check if crashed
    if (gameState.crash.multiplier >= gameState.crash.crashPoint) {
      gameState.crash.status = 'crashed'
      gameState.crash.nextGameTime = now + 5000 // Show crash for 5 seconds
    }
  }
  // If crashed and wait time is over, start new round
  else if (gameState.crash.status === 'crashed' && now >= gameState.crash.nextGameTime) {
    gameState.crash.status = 'waiting'
    gameState.crash.multiplier = 1
    gameState.crash.crashPoint = generateCrashPoint()
    gameState.crash.nextGameTime = now + 20000 // Next game in 20 seconds
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Update game state every 100ms
      setInterval(() => {
        updateCrashGame()
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
