
import { useState } from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Coinflip = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipCoin = () => {
    if (!selectedSide) {
      toast.error("Please select heads or tails");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsFlipping(true);
    setBalance(prev => prev - betAmount);

    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      
      if (result === selectedSide) {
        const winAmount = betAmount * 1.9; // 1.9x payout
        setBalance(prev => prev + winAmount);
        toast.success(`You won $${winAmount.toFixed(2)}!`);
      } else {
        toast.error(`Lost! Coin landed on ${result}`);
      }

      setIsFlipping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      {/* Header */}
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

      {/* Game Area */}
      <div className="glass-card p-8 max-w-2xl mx-auto">
        <div className="space-y-8">
          {/* Coin */}
          <div className="flex justify-center">
            <div 
              className={`w-48 h-48 rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center text-2xl font-bold
                ${isFlipping ? "animate-[spin_2s_ease-in-out]" : ""}
                ${selectedSide === "heads" ? "ring-2 ring-neon-green" : ""}
              `}
            >
              Heads
            </div>
            <div 
              className={`w-48 h-48 rounded-full bg-yellow-700 border-4 border-yellow-800 flex items-center justify-center text-2xl font-bold ml-8
                ${isFlipping ? "animate-[spin_2s_ease-in-out]" : ""}
                ${selectedSide === "tails" ? "ring-2 ring-neon-green" : ""}
              `}
            >
              Tails
            </div>
          </div>

          {/* Side Selection */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedSide("heads")}
              disabled={isFlipping}
              className={`play-button w-32 ${selectedSide === "heads" ? "bg-neon-green/30" : ""}`}
            >
              Heads
            </button>
            <button
              onClick={() => setSelectedSide("tails")}
              disabled={isFlipping}
              className={`play-button w-32 ${selectedSide === "tails" ? "bg-neon-green/30" : ""}`}
            >
              Tails
            </button>
          </div>

          {/* Betting Controls */}
          <div className="flex gap-4 items-center justify-center">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
              max={balance}
              disabled={isFlipping}
              className="w-32 px-4 py-2 rounded-lg bg-casino-accent text-white border border-neon-green/20"
            />
            <button
              onClick={flipCoin}
              disabled={isFlipping || !selectedSide}
              className="play-button w-auto"
            >
              {isFlipping ? "Flipping..." : "Flip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coinflip;
