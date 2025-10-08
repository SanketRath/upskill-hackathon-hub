import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  organizer: string;
  location: string;
  event_date: string;
  prize_money: number;
  tags: string[];
  team_size_min: number;
  team_size_max: number;
  registered_count: number;
  total_slots: number;
  event_type: string;
}

const Competitions = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">All Competitions</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} to={`/event/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {event.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {event.organizer}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </div>
                    {event.prize_money && (
                      <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                        <Trophy className="h-4 w-4" />
                        <span>₹{event.prize_money.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.team_size_min === event.team_size_max
                          ? `${event.team_size_min} ${
                              event.team_size_min === 1 ? "member" : "members"
                            }`
                          : `${event.team_size_min} - ${event.team_size_max} members`}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.registered_count} / {event.total_slots} registered
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Competitions;
