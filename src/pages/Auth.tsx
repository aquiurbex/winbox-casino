
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      
      // Since Supabase requires an email for authentication, we'll generate a dummy one
      // Using the username as the basis for login
      const dummyEmail = `${username.toLowerCase().replace(/\s+/g, '')}@example.com`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully logged in!");
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      
      // Create a deterministic email from username so it's always the same for the same username
      // This allows users to log in with just their username later
      const dummyEmail = `${username.toLowerCase().replace(/\s+/g, '')}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password,
        options: {
          data: {
            username,
          },
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Registration successful! You can now login.");
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error("Failed to register");
    } finally {
      setLoading(false);
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
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <h1 className="text-2xl font-bold text-center mb-8">Login</h1>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button 
                onClick={handleLogin} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <h1 className="text-2xl font-bold text-center mb-8">Register</h1>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                onClick={handleSignUp} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : "Register"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
