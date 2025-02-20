
import { useState } from "react";
import { ArrowLeft, Coins, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Store = () => {
  const [skinUrl, setSkinUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const tradeSkin = async () => {
    try {
      setLoading(true);

      // Extract market hash name from Steam URL
      const marketHashName = skinUrl.split('/')[6]?.replace(/_/g, ' ');
      if (!marketHashName) {
        toast.error("Invalid Steam Market URL");
        return;
      }

      // Get price from Steam Market
      const { data, error } = await supabase.functions.invoke('steam-market', {
        body: { market_hash_name: marketHashName }
      });

      if (error) {
        console.error('Steam market error:', error);
        toast.error("Failed to fetch skin price");
        return;
      }

      if (data.coins) {
        // Award coins to user
        const { error: updateError } = await supabase.rpc('award_skin_coins', {
          amount: data.coins
        });

        if (updateError) {
          toast.error("Failed to update balance");
          return;
        }

        toast.success(`Successfully traded skin for ${data.coins} coins!`);
        setSkinUrl("");
      }
    } catch (err) {
      console.error('Trade error:', err);
      toast.error("Failed to process trade");
    } finally {
      setLoading(false);
    }
  };

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

      <div className="glass-card p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Trade Skins for Coins</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Steam Market URL</label>
            <Input
              placeholder="Paste Steam Market URL here..."
              value={skinUrl}
              onChange={(e) => setSkinUrl(e.target.value)}
            />
            <p className="text-xs text-white/40">
              Example: https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Slate%20(Factory%20New)
            </p>
          </div>

          <Button 
            onClick={tradeSkin} 
            disabled={loading || !skinUrl} 
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {loading ? "Processing..." : "Trade Skin for Coins"}
          </Button>

          <div className="text-center text-sm text-white/60">
            <p>Each coin is worth €0.01</p>
            <p>For example, a €16.99 skin would give you 1,699 coins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
