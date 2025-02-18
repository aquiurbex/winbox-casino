import { useState, useEffect } from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Wheel = () => {
  const { gameState } = useGame();
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [session, setSession] = useState<any>(null);

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

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Coming Soon</h1>
        <p className="text-center text-white/60">The Wheel game is under development. Check back soon!</p>
      </div>
    </div>
  );
};

export default Wheel;
