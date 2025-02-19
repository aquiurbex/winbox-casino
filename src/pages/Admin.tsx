
import { useState, useEffect } from "react";
import { ArrowLeft, User, Package, Lock } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminCredentials, setAdminCredentials] = useState({ username: 'admin', password: 'admin' });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [skins, setSkins] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadSkins();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsAuthenticated(true);
      toast.success("Logged in as admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      toast.error("Failed to load users");
      return;
    }

    setUsers(data || []);
  };

  const loadSkins = async () => {
    const { data, error } = await supabase
      .from('skins')
      .select('*');
    
    if (error) {
      toast.error("Failed to load skins");
      return;
    }

    setSkins(data || []);
  };

  const updateUserCoins = async (userId: string, amount: number) => {
    const { error } = await supabase
      .from('profiles')
      .update({ coins: amount })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to update user coins");
      return;
    }

    toast.success("User coins updated");
    loadUsers();
  };

  const addSkinToUser = async (userId: string, skinId: string) => {
    const { error } = await supabase
      .from('user_skins')
      .insert([{ user_id: userId, skin_id: skinId }]);

    if (error) {
      toast.error("Failed to add skin to user");
      return;
    }

    toast.success("Skin added to user");
  };

  const updateAdminCredentials = (newUsername: string, newPassword: string) => {
    setAdminCredentials({ username: newUsername, password: newPassword });
    toast.success("Admin credentials updated");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full container py-8 space-y-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
        </div>

        <div className="glass-card p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="text-sm text-white/60">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
        <Button variant="ghost" onClick={() => setIsAuthenticated(false)}>
          Logout
        </Button>
      </div>

      <div className="glass-card p-8">
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="skins">Skins</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
            <div className="grid gap-4">
              {users.map(user => (
                <div key={user.id} className="p-4 bg-casino-accent rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.username || 'Anonymous'}</p>
                    <p className="text-sm text-white/60">{user.coins} coins</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="w-32"
                      onChange={(e) => {
                        if (user.id === selectedUser) {
                          updateUserCoins(user.id, parseInt(e.target.value));
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(user.id)}
                    >
                      Update Coins
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skins" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Manage Skins</h2>
            <div className="grid gap-4">
              {skins.map(skin => (
                <div key={skin.id} className="p-4 bg-casino-accent rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{skin.name}</p>
                    <p className="text-sm text-white/60">{skin.price} coins</p>
                  </div>
                  {selectedUser && (
                    <Button
                      variant="outline"
                      onClick={() => addSkinToUser(selectedUser, skin.id)}
                    >
                      Add to Selected User
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Admin Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60">New Username</label>
                <Input
                  type="text"
                  placeholder="Enter new admin username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/60">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new admin password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={() => updateAdminCredentials(username, password)}
              >
                Update Credentials
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
