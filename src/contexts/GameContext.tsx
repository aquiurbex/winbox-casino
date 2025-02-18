
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface GameState {
  crash: {
    status: 'waiting' | 'running' | 'crashed'
    multiplier: number
    startTime: number
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

interface GameHistory {
  game_type: 'crash' | 'roulette' | 'wheel'
  result: number
  created_at: string
}

interface GameContextType {
  gameState: GameState
  history: GameHistory[]
}

const GameContext = createContext<GameContextType | null>(null)

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    crash: {
      status: 'waiting',
      multiplier: 1,
      startTime: Date.now()
    },
    roulette: {
      status: 'waiting',
      lastResult: 0,
      nextSpinTime: Date.now()
    },
    wheel: {
      status: 'waiting',
      lastResult: 0,
      nextSpinTime: Date.now()
    }
  })
  
  const [history, setHistory] = useState<GameHistory[]>([])

  useEffect(() => {
    // Connect to game coordinator
    const eventSource = new EventSource(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-coordinator/game-state`
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setGameState(data)
    }

    // Subscribe to game history updates
    const historySubscription = supabase
      .from('game_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setHistory(data as GameHistory[])
        }
      })

    const channel = supabase
      .channel('game_history')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_history'
        },
        (payload) => {
          setHistory(prev => [payload.new as GameHistory, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => {
      eventSource.close()
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <GameContext.Provider value={{ gameState, history }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}
