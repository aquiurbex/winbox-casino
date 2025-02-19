
import { useState, useEffect } from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MULTIPLIERS = [1, 2, 3, 5, 10, 20, 30, 40, 50];

const Wheel = () => {
  const { gameState } = useGame();
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [session, setSession] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        supabase
          .from('profiles')
          .select('coins')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setBalance(data.coins)
            }
          })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const placeBet = async () => {
    if (!session) {
      toast.error("Please login to play")
      return
    }

    if (betAmount > balance) {
      toast.error("Insufficient balance")
      return
    }

    if (betAmount < 100) {
      toast.error("Minimum bet is 100 coins")
      return
    }

    const { error } = await supabase.rpc('place_bet', {
      amount: betAmount,
      game: 'wheel'
    })

    if (error) {
      toast.error(error.message)
      return
    }

    setBalance(prev => prev - betAmount)
    setIsSpinning(true)

    // Wait for next game result
    setTimeout(() => {
      const multiplier = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
      const winAmount = betAmount * multiplier;
      
      supabase.rpc('cash_out', {
        amount: winAmount,
        game: 'wheel'
      }).then(({ error }) => {
        if (error) {
          toast.error(error.message)
          return
        }
        setBalance(prev => prev + winAmount)
        toast.success(`Won ${winAmount} coins!`)
      })

      setIsSpinning(false)
    }, 5000)
  }

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
        {session ? (
          <div className="stats-card">
            <div className="w-8 h-8 rounded-full bg-neon-green/10 flex items-center justify-center">
              <Coins className="w-4 h-4 text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-white/60">Balance</p>
              <p className="text-lg font-semibold">{balance.toLocaleString()} coins</p>
            </div>
          </div>
        ) : (
          <Link to="/auth" className="play-button">
            Login with Steam
          </Link>
        )}
      </div>

      <div className="glass-card p-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className={`relative aspect-square max-w-xl mx-auto ${isSpinning ? 'animate-spin-slow' : ''}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-neon-green transform rotate-45" />
            </div>
            <div className="absolute inset-0">
              {MULTIPLIERS.map((multiplier, i) => (
                <div
                  key={multiplier}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `rotate(${(i * 360) / MULTIPLIERS.length}deg) translateY(-45%)`,
                  }}
                >
                  <div className={`text-xl font-bold ${isSpinning ? 'blur-sm' : ''}`}>
                    {multiplier}x
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={100}
              max={balance}
              disabled={isSpinning}
              className="w-32 px-4 py-2 rounded-lg bg-casino-accent text-white border border-neon-green/20"
            />
            <button
              onClick={placeBet}
              disabled={isSpinning || !session}
              className="play-button w-auto"
            >
              {isSpinning ? "Spinning..." : "Spin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wheel;
