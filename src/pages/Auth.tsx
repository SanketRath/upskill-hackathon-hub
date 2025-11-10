import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import upskillLogo from "@/assets/upskill-logo.png";
import { loginSchema, signupSchema } from "@/lib/validations";

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
  const [userRole, setUserRole] = useState<"student" | "organizer" | "admin">("student");
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
      // Validate login data
      const validation = loginSchema.safeParse({
        username: formData.username,
        password: formData.password,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(`${firstError.path.join(".")}: ${firstError.message}`);
      }

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

    setLoading(true);

    try {
      // Validate signup data
      const validation = signupSchema.safeParse({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.username,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      // Insert user role
      if (data.user) {
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: userRole,
        });
      }

      if (userRole === "organizer") {
        navigate("/organizer-info");
      } else if (userRole === "admin") {
        navigate("/admin-dashboard");
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

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-4 left-4">
        <img src={upskillLogo} alt="upSkill" className="h-10" />
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
                <>
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

                  <div className="mb-4">
                    <Label>I am a</Label>
                    <RadioGroup value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="font-normal cursor-pointer">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="organizer" id="organizer" />
                        <Label htmlFor="organizer" className="font-normal cursor-pointer">Organizer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="font-normal cursor-pointer">Admin</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
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
