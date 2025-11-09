import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, BarChart3, Users, Eye } from "lucide-react";
import upskillLogo from "@/assets/upskill-logo.png";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface Event {
  id: string;
  title: string;
  event_date: string;
  registered_count: number;
  impressions: number;
  total_slots: number;
}

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: roleLoading } = useRoleCheck("organizer");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const upcomingEvents = events.filter(event => new Date(event.event_date) >= today);
  const pastEvents = events.filter(event => new Date(event.event_date) < today);

  useEffect(() => {
    if (isAuthorized) {
      fetchEvents();
    }
  }, [isAuthorized]);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: organizer } = await supabase
        .from("organizers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!organizer) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", organizer.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (roleLoading || loading) {
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
          <div className="flex gap-2">
            <Button onClick={() => navigate("/create-event")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Events</h1>

        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No events created yet</p>
            <Button onClick={() => navigate("/create-event")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Button>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Recently Launched Events */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Recently Launched Events</h2>
              {upcomingEvents.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No upcoming events</p>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="p-6">
                      <h3 className="font-bold text-lg mb-4">{event.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.registered_count}/{event.total_slots} registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{event.impressions} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => navigate(`/event-analytics/${event.id}`)}
                      >
                        View Analytics
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Events */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Past Events</h2>
              {pastEvents.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No past events</p>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event) => (
                    <Card key={event.id} className="p-6">
                      <h3 className="font-bold text-lg mb-4">{event.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.registered_count}/{event.total_slots} registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{event.impressions} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => navigate(`/event-analytics/${event.id}`)}
                      >
                        View Analytics
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
