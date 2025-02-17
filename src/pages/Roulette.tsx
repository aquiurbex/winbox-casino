
import { useState } from "react";
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ROULETTE_NUMBERS = Array.from({ length: 15 }, (_, i) => ({
  number: i + 1,
  color: i % 2 === 0 ? "red" : "black"
}));

const Roulette = () => {
  const [balance, setBalance] = useState(1000);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinRoulette = () => {
    if (!selectedNumber) {
      toast.error("Please select a number");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSpinning(true);
    setBalance(prev => prev - betAmount);

    // Simulate roulette spin
    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 15) + 1;
      if (winningNumber === selectedNumber) {
        const winAmount = betAmount * 14;
        setBalance(prev => prev + winAmount);
        toast.success(`You won $${winAmount}!`);
      } else {
        toast.error(`Lost! Winning number was ${winningNumber}`);
      }
      setIsSpinning(false);
    }, 3000);
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
      <div className="glass-card p-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Roulette Numbers */}
          <div className="grid grid-cols-5 gap-4">
            {ROULETTE_NUMBERS.map(({ number, color }) => (
              <button
                key={number}
                onClick={() => setSelectedNumber(number)}
                disabled={isSpinning}
                className={`
                  aspect-square rounded-lg text-2xl font-bold transition-all duration-300
                  ${color === "red" ? "bg-red-500/20" : "bg-gray-800"}
                  ${selectedNumber === number ? "ring-2 ring-neon-green scale-105" : ""}
                  hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Betting Controls */}
          <div className="flex gap-4 items-center justify-center">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1}
              max={balance}
              disabled={isSpinning}
              className="w-32 px-4 py-2 rounded-lg bg-casino-accent text-white border border-neon-green/20"
            />
            <button
              onClick={spinRoulette}
              disabled={isSpinning || !selectedNumber}
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

export default Roulette;
