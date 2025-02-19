import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

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
      startTime: Date.now() + 20000, // Start in 20 seconds
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
  })
  
  const [history, setHistory] = useState<GameHistory[]>([])

  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-coordinator/game-state`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setGameState(data);
    };

    // Subscribe to game history updates
    const historySubscription = supabase
      .from('game_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setHistory(data as GameHistory[]);
        }
      });

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
          setHistory(prev => [payload.new as GameHistory, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // Update Steam user information and check for CS2 rewards
    const updateSteamInfo = async () => {
      const session = await supabase.auth.getSession();
      if (session?.data?.session?.user?.app_metadata?.provider === 'steam') {
        // Get Steam profile and CS2 stats
        // Add coins for kills if username contains "skins com"
        // This would be implemented in a separate Edge Function
      }
    };

    const steamInfoInterval = setInterval(updateSteamInfo, 60000); // Check every minute

    return () => {
      eventSource.close();
      supabase.removeChannel(channel);
      clearInterval(steamInfoInterval);
    };
  }, []);

  return (
    <GameContext.Provider value={{ gameState, history }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}
