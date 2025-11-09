import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRoleCheck = (requiredRole: "student" | "organizer") => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        // Check user role from user_roles table
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !roleData) {
          toast({
            title: "Access Denied",
            description: "Unable to verify your role",
            variant: "destructive",
          });
          navigate("/home");
          return;
        }

        if (roleData.role !== requiredRole) {
          toast({
            title: "Access Denied",
            description: `This page is only accessible to ${requiredRole}s`,
            variant: "destructive",
          });
          navigate("/home");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking role:", error);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [requiredRole, navigate, toast]);

  return { isAuthorized, loading };
};
