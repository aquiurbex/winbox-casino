import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Crash = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const gameInterval = useRef<number | null>(null);
  const crashPoint = useRef(0);
  const startTime = useRef<number>(0);

  const startGame = () => {
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (betAmount < 1) {
      toast.error("Minimum bet is $1");
      return;
    }

    crashPoint.current = 1 + Math.random() * 4;
    setBalance(prev => prev - betAmount);
    setCurrentBet(betAmount);
    setIsPlaying(true);
    setIsCrashed(false);
    setMultiplier(1);
    startTime.current = Date.now();

    gameInterval.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      setMultiplier(prev => {
        const newMultiplier = 1 + (Math.pow(elapsed, 1.5) / 2);
        if (newMultiplier >= crashPoint.current) {
          endGame(true);
        }
        return newMultiplier;
      });
    }, 16);
  };

  const cashOut = () => {
    if (!isPlaying) return;
    const winAmount = currentBet * multiplier;
    setBalance(prev => prev + winAmount);
    toast.success(`Cashed out $${winAmount.toFixed(2)}!`);
    endGame(false);
  };

  const endGame = (crashed: boolean) => {
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
    }
    setIsPlaying(false);
    setIsCrashed(crashed);
    if (crashed) {
      toast.error("Crashed!");
    }
  };

  useEffect(() => {
    return () => {
      if (gameInterval.current) {
        clearInterval(gameInterval.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
        <div className="stats-card">
          <div className="w-8 h-8 rounded-full bg-neon-green/10 flex items-center justify-center">
            <Coins className="w-4 h-4 text-neon-green" />
          </div>
          <div>
            <p className="text-sm text-white/60">Balance</p>
            <p className="text-lg font-semibold">${balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div 
            className={`text-center transform transition-transform ${
              isPlaying ? "translate-y-0" : "translate-y-2"
            } ${isCrashed ? "crash-animation" : ""}`}
          >
            <h2 
              className={`text-6xl font-bold ${
                isCrashed 
                  ? "text-red-500" 
                  : isPlaying 
                    ? "text-neon-green animate-glow scale-110 transition-transform duration-300" 
                    : "text-white"
              }`}
            >
              {multiplier.toFixed(2)}x
            </h2>
            <Progress 
              value={((multiplier - 1) / 4) * 100} 
              className={`mt-4 transition-all duration-300 ${
                isPlaying ? "opacity-100" : "opacity-60"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Bet Amount</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={1}
                max={balance}
                disabled={isPlaying}
                className="bg-casino-accent"
              />
            </div>
            <div className="flex items-end">
              {!isPlaying ? (
                <button
                  onClick={startGame}
                  disabled={isCrashed}
                  className="play-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Game
                </button>
              ) : (
                <button
                  onClick={cashOut}
                  className="w-full py-2 rounded-lg bg-neon-green/20 border border-neon-green/40 hover:bg-neon-green/30 transition-all duration-300 text-white font-medium animate-pulse"
                >
                  Cash Out
                </button>
              )}
            </div>
          </div>

          {isCrashed && (
            <div className="text-center text-red-500 font-semibold animate-fade-in">
              Crashed at {crashPoint.current.toFixed(2)}x
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crash;
