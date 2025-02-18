
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  return (
    <div className="min-h-screen w-full container py-8 space-y-8">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>
      </div>

      <div className="glass-card p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Login / Register</h1>
        <p className="text-center text-white/60">Authentication coming soon!</p>
      </div>
    </div>
  );
};

export default Auth;
