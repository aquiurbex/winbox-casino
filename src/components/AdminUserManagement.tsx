
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  username: string | null;
  coins: number | null;
}

export const AdminUserManagement = ({ user, onUpdate }: { user: User, onUpdate: () => void }) => {
  const [coinAmount, setCoinAmount] = useState<number>(0);

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
    onUpdate();
  };

  const addCoinsToUser = async (userId: string, amount: number) => {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();
    
    if (fetchError || !data) {
      toast.error("Failed to fetch user balance");
      return;
    }
    
    const currentCoins = data.coins || 0;
    const newBalance = currentCoins + amount;
    
    const { error } = await supabase
      .from('profiles')
      .update({ coins: newBalance })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to update user coins");
      return;
    }

    toast.success(`${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} coins`);
    onUpdate();
    setCoinAmount(0);
  };

  return (
    <div className="space-y-4 mt-2 border-t border-white/10 pt-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Set Absolute Balance</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="New balance"
            className="w-full"
            value={user.coins || 0}
            onChange={(e) => updateUserCoins(user.id, parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Add/Remove Coins</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Amount (use negative to subtract)"
            className="w-full"
            value={coinAmount}
            onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
          />
          <Button
            variant="outline"
            onClick={() => addCoinsToUser(user.id, coinAmount)}
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
};
