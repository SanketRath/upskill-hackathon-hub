import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import upskillLogo from "@/assets/upskill-logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <nav className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/home">
            <img src={upskillLogo} alt="upSkill" className="h-10" />
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search For Opportunities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/competitions"
              className="text-foreground hover:text-primary transition-colors"
            >
              Competitions
            </Link>
            <Link
              to="/my-registrations"
              className="text-foreground hover:text-primary transition-colors"
            >
              Registrations
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="focus:outline-none"
            >
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div className={`fixed right-0 top-0 h-full w-80 bg-card shadow-lg z-50 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-3 mb-8 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{userName || "User"}</p>
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <Link
              to="/my-registrations"
              className="block py-3 px-4 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Registrations
            </Link>
            <Link
              to="/competitions"
              className="block py-3 px-4 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Past Competitions
            </Link>
            <Link
              to="/my-registrations"
              className="block py-3 px-4 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              My Rounds
            </Link>
            <Link
              to="/home"
              className="block py-3 px-4 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Recently Viewed
            </Link>
            <Link
              to="/user-info"
              className="block py-3 px-4 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors mt-4"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
