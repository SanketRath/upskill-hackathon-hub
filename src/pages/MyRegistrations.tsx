import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy } from "lucide-react";

interface Registration {
  id: string;
  event_id: string;
  status: string;
  events: {
    id: string;
    title: string;
    organizer: string;
    location: string;
    event_date: string;
    prize_money: number;
    tags: string[];
  };
}

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My Registrations</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : registrations.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No registrations yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => (
              <Link
                key={registration.id}
                to={`/event/${registration.event_id}`}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="default">{registration.status}</Badge>
                      {registration.events.tags?.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {registration.events.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {registration.events.organizer}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {registration.events.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(
                          registration.events.event_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {registration.events.prize_money && (
                      <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                        <Trophy className="h-4 w-4" />
                        <span>
                          ₹{registration.events.prize_money.toLocaleString()}
                        </span>
                      </div>
                    )}
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

export default MyRegistrations;
