import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Activity, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message?.includes("401") ? "Invalid email or password" : (err.message || "Login failed");
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(224, 71%, 4%)" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 30% 50%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)"
        }} />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">GymCRM</h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Complete gym management system for owners, admins, coaches and members.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              ["Multi-Branch", "Manage all locations from one place"],
              ["Class Booking", "Schedule and track all sessions"],
              ["Payments", "Full payment and subscription tracking"],
              ["CRM Leads", "Convert prospects to members"],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white/5 rounded-xl p-4 border border-white/8 text-left">
                <div className="text-white text-sm font-semibold mb-1">{title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex flex-1 lg:max-w-md xl:max-w-lg items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GymCRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              data-testid="button-login"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo credentials</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div><span className="text-gray-400 w-20 inline-block">Email:</span> owner@gymcrm.com</div>
              <div><span className="text-gray-400 w-20 inline-block">Password:</span> Owner@2024!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
