
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loginWithSteam = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'steam',
        options: {
          queryParams: {
            redirect_to: window.location.origin
          },
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('Steam login error:', error);
        toast.error("Failed to login with Steam");
      }
    } catch (err) {
      console.error('Steam login caught error:', err);
      toast.error("Failed to login with Steam");
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
        <h1 className="text-2xl font-bold text-center mb-8">Login</h1>
        <Button onClick={loginWithSteam} className="w-full">
          Login with Steam
        </Button>
      </div>
    </div>
  );
};

export default Auth;
