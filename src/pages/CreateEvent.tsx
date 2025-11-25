import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import upskillLogo from "@/assets/upskill-logo.png";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { createEventSchema } from "@/lib/validations";

interface CustomSection {
  title: string;
  description: string;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: roleLoading } = useRoleCheck("organizer");
  const [loading, setLoading] = useState(false);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    location: "",
    eventType: "",
    eventDate: "",
    registrationDeadline: "",
    teamSizeMin: 1,
    teamSizeMax: 1,
    totalSlots: 100,
    registrationFee: 0,
    prizeMoney: "",
    posterUrl: "",
    description: "",
    eligibility: "",
    stages: "",
    details: "",
    datesDeadlines: "",
    prizes: "",
    submissionType: "none" as "none" | "github_link" | "zip_file" | "both",
  });

  const addCustomSection = () => {
    setCustomSections([...customSections, { title: "", description: "" }]);
  };

  const removeCustomSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index));
  };

  const updateCustomSection = (index: number, field: keyof CustomSection, value: string) => {
    const updated = [...customSections];
    updated[index][field] = value;
    setCustomSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validation = createEventSchema.safeParse(formData);
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(`${firstError.path.join(".")}: ${firstError.message}`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: organizer } = await supabase
        .from("organizers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!organizer) throw new Error("Organizer profile not found");

      const { error } = await supabase.from("events").insert({
        // @ts-ignore - organizer_id will be available after migration
        organizer_id: organizer.id,
        title: formData.title,
        organizer: formData.organizer,
        location: formData.location,
        event_type: formData.eventType || "Hackathon",
        event_date: formData.eventDate,
        registration_deadline: formData.registrationDeadline,
        team_size_min: formData.teamSizeMin,
        team_size_max: formData.teamSizeMax,
        total_slots: formData.totalSlots,
        registration_fee: formData.registrationFee,
        prize_money: formData.prizeMoney ? parseInt(formData.prizeMoney) : null,
        poster_url: formData.posterUrl,
        description: formData.description,
        eligibility: formData.eligibility || "Everyone can apply",
        stages: formData.stages,
        details: formData.details,
        dates_deadlines: formData.datesDeadlines,
        prizes: formData.prizes,
        custom_sections: customSections,
        submission_type: formData.submissionType,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      navigate("/organizer-dashboard");
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

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src={upskillLogo} alt="upSkill" className="h-10" />
          <Button variant="outline" onClick={() => navigate("/organizer-dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="posterUrl">Event Poster URL *</Label>
                <Input
                  id="posterUrl"
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Venue *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
                  <Input
                    id="registrationDeadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamSizeMin">Min Team Size *</Label>
                  <Input
                    id="teamSizeMin"
                    type="number"
                    min="1"
                    value={formData.teamSizeMin}
                    onChange={(e) => setFormData({ ...formData, teamSizeMin: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="teamSizeMax">Max Team Size *</Label>
                  <Input
                    id="teamSizeMax"
                    type="number"
                    min="1"
                    value={formData.teamSizeMax}
                    onChange={(e) => setFormData({ ...formData, teamSizeMax: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalSlots">Total Teams Allowed *</Label>
                  <Input
                    id="totalSlots"
                    type="number"
                    min="1"
                    value={formData.totalSlots}
                    onChange={(e) => setFormData({ ...formData, totalSlots: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="prizeMoney">Prize Money</Label>
                  <Input
                    id="prizeMoney"
                    type="number"
                    min="0"
                    value={formData.prizeMoney}
                    onChange={(e) => setFormData({ ...formData, prizeMoney: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Additional Details (Optional)</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eligibility">Eligibility</Label>
                <Textarea
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="stages">Stages</Label>
                <Textarea
                  id="stages"
                  value={formData.stages}
                  onChange={(e) => setFormData({ ...formData, stages: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="prizes">Prizes</Label>
                <Textarea
                  id="prizes"
                  value={formData.prizes}
                  onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="submissionType">Submission Type</Label>
                <select
                  id="submissionType"
                  value={formData.submissionType}
                  onChange={(e) => setFormData({ ...formData, submissionType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="none">No Submission Required</option>
                  <option value="github_link">GitHub Link Only</option>
                  <option value="zip_file">ZIP File Only</option>
                  <option value="both">Both GitHub Link and ZIP File</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Custom Sections</h2>
              <Button type="button" variant="outline" onClick={addCustomSection}>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>

            {customSections.map((section, index) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Section {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomSection(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateCustomSection(index, "title", e.target.value)}
                      placeholder="Section title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={section.description}
                      onChange={(e) => updateCustomSection(index, "description", e.target.value)}
                      placeholder="Section description"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
