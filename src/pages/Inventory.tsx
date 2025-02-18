
import { ArrowLeft, Coins } from "lucide-react";
import { Link } from "react-router-dom";

const Inventory = () => {
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
            <p className="text-lg font-semibold">0 coins</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Your Inventory</h1>
        <p className="text-center text-white/60">Your inventory is empty. Visit the store to get some skins!</p>
      </div>
    </div>
  );
};

export default Inventory;
