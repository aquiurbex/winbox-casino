
import { useState, useEffect } from "react"
import { ArrowLeft, Coins } from "lucide-react"
import { Link } from "react-router-dom"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useGame } from "@/contexts/GameContext"
import { supabase } from "@/integrations/supabase/client"

const Crash = () => {
  const { gameState } = useGame()
  const [balance, setBalance] = useState(1000)
  const [betAmount, setBetAmount] = useState(100)
  const [autoCashout, setAutoCashout] = useState<number>(2)
  const [currentBet, setCurrentBet] = useState(0)
  const [hasBet, setHasBet] = useState(false)
  const [points, setPoints] = useState<{x: number; y: number}[]>([])
  const [countdown, setCountdown] = useState(0)

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.crash.status === 'waiting') {
        setCountdown(Math.max(0, Math.floor((gameState.crash.nextGameTime - Date.now()) / 1000)))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [gameState.crash.nextGameTime])

  useEffect(() => {
    // Auto cashout logic
    if (gameState.crash.status === 'running' && hasBet && autoCashout) {
      if (gameState.crash.multiplier >= autoCashout) {
        cashOut()
      }
    }

    // Reset bet when game crashes
    if (gameState.crash.status === 'crashed') {
      setHasBet(false)
    }
  }, [gameState.crash.multiplier, gameState.crash.status, hasBet, autoCashout])

  useEffect(() => {
    if (gameState.crash.status === 'running') {
      const elapsed = (Date.now() - gameState.crash.startTime) / 1000
      setPoints(prev => [...prev, {
        x: elapsed,
        y: gameState.crash.multiplier
      }])
    } else if (gameState.crash.status === 'waiting') {
      setPoints([])
    }
  }, [gameState.crash])

  const placeBet = async () => {
    if (betAmount > balance) {
      toast.error("Insufficient balance")
      return
    }

    if (betAmount < 100) {
      toast.error("Minimum bet is 100 coins")
      return
    }

    if (gameState.crash.status !== 'waiting') {
      toast.error("Wait for next round")
      return
    }

    // Update local balance for testing
    setBalance(prev => prev - betAmount)
    setCurrentBet(betAmount)
    setHasBet(true)

    // Broadcast bet to other players
    await supabase
      .channel('crash_game')
      .send({
        type: 'broadcast',
        event: 'crash_bet',
        payload: {
          id: 'test-user-' + Math.random(),
          username: 'Test User',
          bet: betAmount,
          autoCashout: autoCashout
        }
      })
  }

  const cashOut = async () => {
    if (!hasBet || gameState.crash.status !== 'running') return

    const winAmount = Math.floor(currentBet * gameState.crash.multiplier)
    
    // Update local balance for testing
    setBalance(prev => prev + winAmount)
    setHasBet(false)

    // Broadcast cashout to other players
    await supabase
      .channel('crash_game')
      .send({
        type: 'broadcast',
        event: 'crash_cashout',
        payload: {
          id: 'test-user',
          winAmount
        }
      })

    toast.success(`Cashed out ${winAmount} coins!`)
  }

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
        <div className="stats-card">
          <div className="w-8 h-8 rounded-full bg-neon-green/10 flex items-center justify-center">
            <Coins className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <p className="text-sm text-white/60">Balance</p>
            <p className="text-lg font-semibold">{balance.toLocaleString()} coins</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className={`h-64 w-full relative ${gameState.crash.status === 'crashed' ? "crash-animation" : ""}`}>
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d={points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x * 10} ${100 - point.y * 20}`).join(" ")} 
                stroke={gameState.crash.status === 'crashed' ? "rgb(239, 68, 68)" : "rgb(0, 255, 156)"} 
                strokeWidth="0.5" 
                fill="none" 
                className="transition-all duration-300" 
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <h2 className={`text-6xl font-bold ${
                gameState.crash.status === 'crashed' 
                  ? "text-red-500" 
                  : gameState.crash.status === 'running'
                    ? "text-neon-green animate-glow scale-110 transition-transform duration-300" 
                    : "text-white"
              }`}>
                {gameState.crash.multiplier.toFixed(2)}x
              </h2>
            </div>
          </div>

          {gameState.crash.status === 'waiting' && (
            <div className="text-center">
              <p className="text-white/60">Next game in {countdown} seconds</p>
            </div>
          )}

          <Progress 
            value={(gameState.crash.multiplier - 1) / 10 * 100} 
            className={`transition-all duration-300 ${gameState.crash.status === 'running' ? "opacity-100" : "opacity-60"}`} 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Bet Amount</label>
              <Input 
                type="number" 
                value={betAmount} 
                onChange={e => setBetAmount(Number(e.target.value))} 
                min={100} 
                max={balance} 
                disabled={hasBet || gameState.crash.status !== 'waiting'} 
                className="bg-casino-accent rounded-lg" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Auto Cashout</label>
              <Input 
                type="number" 
                value={autoCashout} 
                onChange={e => setAutoCashout(Number(e.target.value))} 
                min={1.1} 
                step={0.1}
                disabled={hasBet || gameState.crash.status !== 'waiting'} 
                className="bg-casino-accent rounded-lg" 
              />
            </div>
            <div className="flex items-end">
              {!hasBet ? (
                <button 
                  onClick={placeBet}
                  disabled={gameState.crash.status !== 'waiting'} 
                  className="play-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Bet
                </button>
              ) : (
                <button 
                  onClick={cashOut}
                  disabled={gameState.crash.status !== 'running' || gameState.crash.multiplier < 1.1} 
                  className="w-full py-2 rounded-lg bg-neon-green/20 border border-neon-green/40 hover:bg-neon-green/30 transition-all duration-300 text-white font-medium animate-pulse"
                >
                  Cash Out ({Math.floor(currentBet * gameState.crash.multiplier)} coins)
                </button>
              )}
            </div>
          </div>

          {gameState.crash.status === 'crashed' && (
            <div className="text-center text-red-500 font-semibold animate-fade-in">
              Crashed at {gameState.crash.multiplier.toFixed(2)}x
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Current Players</h3>
            <div className="space-y-2">
              {gameState.crash.players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                  <span>{player.username}</span>
                  <div className="flex items-center gap-4">
                    <span>{player.bet.toLocaleString()} coins</span>
                    {player.cashedOut && (
                      <span className="text-neon-green">
                        +{player.winAmount?.toLocaleString()} coins
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Crash
