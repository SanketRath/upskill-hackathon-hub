import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const UserInfo = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    collegeName: "",
    degree: "",
    passoutYear: "",
    heardFrom: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from("profiles").insert({
        user_id: user.id,
        full_name: formData.fullName,
        college_name: formData.collegeName,
        degree: formData.degree,
        passout_year: parseInt(formData.passoutYear),
        heard_from: formData.heardFrom,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile created successfully!",
      });

      navigate("/home");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-primary">upSkill</h1>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Additional Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="collegeName">College Name</Label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) =>
                  setFormData({ ...formData, collegeName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) =>
                  setFormData({ ...formData, degree: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="passoutYear">Passout Year</Label>
              <Input
                id="passoutYear"
                type="number"
                min="2020"
                max="2030"
                value={formData.passoutYear}
                onChange={(e) =>
                  setFormData({ ...formData, passoutYear: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Where did you hear about us?</Label>
              <Select
                value={formData.heardFrom}
                onValueChange={(value) =>
                  setFormData({ ...formData, heardFrom: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserInfo;
