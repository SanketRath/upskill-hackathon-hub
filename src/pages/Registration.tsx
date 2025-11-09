import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { teamMemberSchema } from "@/lib/validations";

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college_name: string;
  photo_url?: string;
  is_leader: boolean;
}

interface Event {
  id: string;
  title: string;
  team_size_min: number;
  team_size_max: number;
  registration_fee: number;
  registered_count: number;
}

const Registration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      name: "",
      email: "",
      phone: "",
      college_name: "",
      is_leader: true,
    },
  ]);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, team_size_min, team_size_max, registration_fee, registered_count")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    }
  };

  const addMember = () => {
    if (!event) return;
    if (teamMembers.length >= event.team_size_max) {
      toast({
        title: "Maximum team size reached",
        variant: "destructive",
      });
      return;
    }

    setTeamMembers([
      ...teamMembers,
      {
        name: "",
        email: "",
        phone: "",
        college_name: "",
        is_leader: false,
      },
    ]);
  };

  const removeMember = (index: number) => {
    if (teamMembers[index].is_leader) {
      toast({
        title: "Cannot remove team leader",
        variant: "destructive",
      });
      return;
    }
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateMember = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      if (!event) throw new Error("Event not found");

      // Validate team size
      if (teamMembers.length < event.team_size_min) {
        throw new Error(
          `Minimum team size is ${event.team_size_min} members`
        );
      }

      // Validate each team member
      for (const member of teamMembers) {
        const validation = teamMemberSchema.safeParse(member);
        if (!validation.success) {
          const firstError = validation.error.errors[0];
          throw new Error(`${firstError.path.join(".")}: ${firstError.message}`);
        }
      }

      // Create registration
      const { data: registration, error: regError } = await supabase
        .from("registrations")
        .insert({
          user_id: user.id,
          event_id: id,
          payment_status: event.registration_fee > 0 ? "pending" : "completed",
          status: "registered",
        })
        .select()
        .single();

      if (regError) throw regError;

      // Add team members
      const membersData = teamMembers.map((member) => ({
        registration_id: registration.id,
        ...member,
      }));

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(membersData);

      if (membersError) throw membersError;

      // Update registered count using atomic database function
      const { error: countError } = await supabase.rpc("increment_registered_count", {
        event_id: id,
      });

      if (countError) throw countError;

      toast({
        title: "Success",
        description: "Registration completed successfully!",
      });

      navigate(`/event/${id}`);
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

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  const isIndividual = event.team_size_max === 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-muted-foreground mb-8">Registration Form</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {member.is_leader
                    ? "Team Leader"
                    : `Team Member ${index + 1}`}
                </h3>
                {!member.is_leader && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMember(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Name *</Label>
                  <Input
                    id={`name-${index}`}
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`email-${index}`}>Email *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={member.email}
                    onChange={(e) =>
                      updateMember(index, "email", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`phone-${index}`}>Phone Number *</Label>
                  <Input
                    id={`phone-${index}`}
                    type="tel"
                    value={member.phone}
                    onChange={(e) =>
                      updateMember(index, "phone", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`college-${index}`}>College Name *</Label>
                  <Input
                    id={`college-${index}`}
                    value={member.college_name}
                    onChange={(e) =>
                      updateMember(index, "college_name", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`photo-${index}`}>Photo URL (Optional)</Label>
                  <Input
                    id={`photo-${index}`}
                    type="url"
                    value={member.photo_url || ""}
                    onChange={(e) =>
                      updateMember(index, "photo_url", e.target.value)
                    }
                  />
                </div>
              </div>
            </Card>
          ))}

          {!isIndividual && teamMembers.length < event.team_size_max && (
            <Button
              type="button"
              variant="outline"
              onClick={addMember}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t">
            {event.registration_fee > 0 ? (
              <div className="text-lg font-semibold">
                Total: ₹{event.registration_fee}
              </div>
            ) : (
              <div></div>
            )}
            <Button type="submit" disabled={loading} size="lg">
              {loading
                ? "Processing..."
                : event.registration_fee > 0
                ? "Proceed to Payment"
                : "Complete Registration"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Registration;
