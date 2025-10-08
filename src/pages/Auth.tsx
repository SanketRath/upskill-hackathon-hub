import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsFlipping(false);
    }, 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.username,
        password: formData.password,
      });

      if (error) throw error;

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (profile) {
        navigate("/home");
      } else {
        navigate("/user-info");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.username,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      navigate("/user-info");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-4 left-4">
        <h1 className="text-3xl font-bold text-primary">upSkill</h1>
      </div>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">

        <div className="perspective-1000">
          <Card
            className={`p-8 transition-all duration-300 ${
              isFlipping ? "animate-flip" : ""
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? "Log In" : "Sign Up"}
            </h2>

            <form onSubmit={isLogin ? handleLogin : handleSignup}>
              {!isLogin && (
                <div className="mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <Label htmlFor="username">
                  {isLogin ? "Username" : "Email"}
                </Label>
                <Input
                  id="username"
                  type="email"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              {!isLogin && (
                <div className="mb-4">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full mb-4" disabled={loading}>
                {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleFlip}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Log In"}
                </button>
              </div>
            </form>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
