
import { useState } from "react";
import { ArrowLeft, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Code = () => {
  const [code, setCode] = useState("");

  const redeemCode = async () => {
    const { error } = await supabase.rpc('use_promo_code', {
      code_input: code.toUpperCase()
    });

    if (error) {
      toast.error("Invalid or already used code");
      return;
    }

    toast.success("Code redeemed successfully!");
    setCode("");
  };

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
      </div>

      <div className="glass-card p-8 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-neon-purple/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-neon-purple" />
          </div>
          <h1 className="text-2xl font-bold">Redeem Code</h1>
          <p className="text-white/60 text-center">Enter your promo code below to receive coins!</p>
          
          <div className="w-full space-y-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="text-center uppercase"
            />
            <Button onClick={redeemCode} className="w-full">
              Redeem Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Code;
