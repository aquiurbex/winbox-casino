
import { useState, useEffect } from "react";
import { ArrowLeft, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Code = () => {
  const [code, setCode] = useState("");
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const redeemCode = async () => {
    // Check if user is logged in
    if (!session) {
      toast.error("Please login to redeem a code");
      navigate("/auth");
      return;
    }

    // Check if the code is valid
    if (code.toUpperCase() !== "COINS") {
      toast.error("Invalid code");
      return;
    }

    // Redeem the code
    try {
      const { error } = await supabase.rpc('award_skin_coins', { 
        amount: 20 
      });

      if (error) {
        console.error("Error redeeming code:", error);
        toast.error("Failed to redeem code");
        return;
      }

      toast.success("Successfully redeemed 20 coins!");
      setCode("");
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred while redeeming the code");
    }
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
