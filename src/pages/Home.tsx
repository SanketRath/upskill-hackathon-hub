import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  organizer: string;
  location: string;
  event_date: string;
  prize_money: number;
  tags: string[];
}

const Home = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Event[]>([]);
  const [wishlist, setWishlist] = useState<Event[]>([]);
  const [upcomingRounds, setUpcomingRounds] = useState<Event[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recently viewed
      const { data: recentData } = await supabase
        .from("recently_viewed")
        .select("event_id, events(*)")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(3);

      if (recentData) {
        setRecentlyViewed(recentData.map((item: any) => item.events));
      }

      // Fetch wishlist
      const { data: wishlistData } = await supabase
        .from("wishlist")
        .select("event_id, events(*)")
        .eq("user_id", user.id)
        .limit(3);

      if (wishlistData) {
        setWishlist(wishlistData.map((item: any) => item.events));
      }

      // Fetch upcoming rounds (registered events)
      const { data: registrationData } = await supabase
        .from("registrations")
        .select("event_id, events(*)")
        .eq("user_id", user.id)
        .limit(3);

      if (registrationData) {
        setUpcomingRounds(registrationData.map((item: any) => item.events));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Link to={`/event/${event.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          <CardDescription className="space-y-2 mt-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.event_date).toLocaleDateString()}</span>
            </div>
            {event.prize_money && (
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <Trophy className="h-4 w-4" />
                <span>₹{event.prize_money.toLocaleString()}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">My Activity</h1>

        {/* Recently Viewed */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Recently Viewed</h2>
          {recentlyViewed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No recently viewed events</p>
            </Card>
          )}
        </section>

        {/* Wishlist */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No events in wishlist</p>
            </Card>
          )}
        </section>

        {/* Upcoming Rounds */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Rounds</h2>
          {upcomingRounds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRounds.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No upcoming events</p>
            </Card>
          )}
        </section>

        {/* Sponsors Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Our Sponsors</h2>
          <div className="relative overflow-hidden bg-muted/30 rounded-lg py-8">
            <div className="flex animate-scroll">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Adobe', 'Oracle', 'IBM', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 mx-8 text-3xl font-bold text-muted-foreground/40"
                  style={{ minWidth: '150px', textAlign: 'center' }}
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="mb-12">
          <Card className="bg-primary text-primary-foreground p-8">
            <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="opacity-90">support@upskill.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="opacity-90">+91 9876543210</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="opacity-90">
                  123 Tech Park, Innovation Street<br />
                  Bangalore, Karnataka 560001
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Home;
