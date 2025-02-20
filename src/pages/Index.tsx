
import { useState, useEffect } from "react";
import { Trophy, Users, Coins, CreditCard, Play, Package, LogIn, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const games = [{
  id: 1,
  title: "Crash",
  description: "Watch the multiplier grow and cash out before it crashes. Play together with all online players!",
  minBet: 500,
  maxBet: 100000,
  players: 0,
  path: "/crash"
}, {
  id: 2,
  title: "Roulette",
  description: "Classic casino game with CS skins. Try your luck on our animated wheel!",
  minBet: 1000,
  maxBet: 200000,
  players: 0,
  path: "/roulette"
}];

const Index = () => {
  const [activePlayers, setActivePlayers] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [gamePlayers, setGamePlayers] = useState<{[key: string]: number}>({});
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to realtime presence updates
    const channel = supabase.channel('online-users')
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const totalUsers = Object.keys(state).length
        setActivePlayers(totalUsers)
        
        // Count players per game
        const playerCounts: {[key: string]: number} = {}
        Object.values(state).forEach((presence: any) => {
          if (presence[0]?.currentGame) {
            playerCounts[presence[0].currentGame] = (playerCounts[presence[0].currentGame] || 0) + 1
          }
        })
        setGamePlayers(playerCounts)
      })
      .subscribe()

    // Fetch total wins and bets
    const fetchStats = async () => {
      const { data: historyData } = await supabase
        .from('game_history')
        .select('result')
        
      if (historyData) {
        const totalWinsAmount = historyData.reduce((acc, game) => acc + (game.result > 1 ? game.result : 0), 0)
        setTotalWins(Math.floor(totalWinsAmount * 100)) // Convert to coins
        setTotalBets(historyData.length * 100) // Average bet of 100 coins per game
      }
    }

    fetchStats()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div className="min-h-screen w-full container py-8 space-y-8">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-4">
          {!session ? (
            <Link to="/auth" className="play-button">
              <LogIn className="w-4 h-4" />
              Login with Steam
            </Link>
          ) : (
            <>
              <Link to="/inventory" className="play-button">
                <Package className="w-4 h-4" />
                Inventory
              </Link>
              <Link to="/store" className="play-button">
                <CreditCard className="w-4 h-4" />
                Store
              </Link>
            </>
          )}
          <Link to="/code" className="play-button">
            <Code className="w-4 h-4" />
            Enter Code
          </Link>
        </div>
      </div>

      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stats-card">
          <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <p className="text-sm text-white/60">Active Players</p>
            <p className="text-lg font-semibold">{activePlayers}</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Winnings</p>
            <p className="text-lg font-semibold">{totalWins.toLocaleString()} coins</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Bets</p>
            <p className="text-lg font-semibold">{totalBets.toLocaleString()} coins</p>
          </div>
        </div>
        <Link to="/store" className="stats-card hover:bg-casino-card transition-colors">
          <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <p className="text-sm text-white/60">Skin Store</p>
            <p className="text-lg font-semibold">Browse Skins →</p>
          </div>
        </Link>
      </div>

      {/* Games Grid */}
      <div className="py-0">
        <h2 className="text-2xl font-bold mb-6">Featured Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map(game => <Link key={game.id} to={game.path} className="group">
              <div className="game-card rounded-2xl bg-neutral-900 hover:bg-neutral-800">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold group-hover:text-neon-green transition-colors">
                    {game.title}
                  </h3>
                  <span className="badge">{gamePlayers[game.title.toLowerCase()] || 0} playing</span>
                </div>
                <p className="text-white/60 text-sm">{game.description}</p>
                <div className="mt-auto">
                  <div className="flex justify-between text-sm text-white/40">
                    <span>Min: {game.minBet} coins</span>
                    <span>Max: {game.maxBet} coins</span>
                  </div>
                  <button className="play-button">
                    <Play className="w-4 h-4" />
                    Play Now
                  </button>
                </div>
              </div>
            </Link>)}
        </div>
      </div>
    </div>;
};

export default Index;
