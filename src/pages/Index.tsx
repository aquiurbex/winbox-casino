
import { useState } from "react";
import { Trophy, Users, Coins, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const games = [
  {
    id: 1,
    title: "Crash",
    description: "Watch the multiplier grow and cash out before it crashes",
    minBet: 5,
    maxBet: 1000,
    players: 128,
    path: "/crash"
  },
  {
    id: 2,
    title: "Roulette",
    description: "Classic casino game with CS skins",
    minBet: 10,
    maxBet: 2000,
    players: 64,
    path: "/roulette"
  },
  {
    id: 3,
    title: "Coinflip",
    description: "50/50 chance to double your skins",
    minBet: 1,
    maxBet: 500,
    players: 256,
    path: "/coinflip"
  },
  {
    id: 4,
    title: "Jackpot",
    description: "Join the pot and win big",
    minBet: 20,
    maxBet: 5000,
    players: 32,
    path: "/jackpot"
  },
];

const Index = () => {
  const [balance, setBalance] = useState(1000);
  const [activePlayers, setActivePlayers] = useState(1337);

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
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
            <p className="text-sm text-white/60">Your Balance</p>
            <p className="text-lg font-semibold">${balance}</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Winnings</p>
            <p className="text-lg font-semibold">$12,345</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <p className="text-sm text-white/60">Deposit</p>
            <button className="text-lg font-semibold hover:text-neon-green transition-colors">
              Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link key={game.id} to={game.path} className="group">
              <div className="game-card">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold group-hover:text-neon-green transition-colors">
                    {game.title}
                  </h3>
                  <span className="badge">{game.players} playing</span>
                </div>
                <p className="text-white/60 text-sm">{game.description}</p>
                <div className="mt-auto">
                  <div className="flex justify-between text-sm text-white/40">
                    <span>Min: ${game.minBet}</span>
                    <span>Max: ${game.maxBet}</span>
                  </div>
                  <div className="w-full mt-4 py-2 rounded-lg bg-casino-accent hover:bg-neon-green/20 border border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 text-white/80 hover:text-white font-medium">
                    Play Now
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Skins */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Skins</h2>
        <div className="glass-card p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-casino-accent/50 animate-float"
              >
                {/* Skin placeholder */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
