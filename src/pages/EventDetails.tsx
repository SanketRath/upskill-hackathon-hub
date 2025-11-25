import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Trophy, Users, Eye, Clock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  organizer: string;
  location: string;
  event_date: string;
  registration_deadline: string;
  prize_money: number;
  tags: string[];
  team_size_min: number;
  team_size_max: number;
  registered_count: number;
  total_slots: number;
  event_type: string;
  description: string;
  eligibility: string;
  stages: string;
  details: string;
  dates_deadlines: string;
  prizes: string;
  impressions: number;
  poster_url: string;
  registration_fee: number;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissionResult, setSubmissionResult] = useState<{
    rating?: number;
    is_selected: boolean;
    result_published: boolean;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      checkRegistrationStatus();
      checkWishlistStatus();
      trackView();
      fetchSubmissionResult();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
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
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single();

      setIsRegistered(!!data);
    } catch (error) {
      // No registration found
    }
  };

  const fetchSubmissionResult = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: registration } = await supabase
        .from("registrations")
        .select("id")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single();

      if (!registration) return;

      const { data: submission } = await supabase
        .from("submissions")
        .select("rating, is_selected_for_next_round, result_published")
        .eq("registration_id", registration.id)
        .single();

      if (submission?.result_published) {
        setSubmissionResult({
          rating: submission.rating,
          is_selected: submission.is_selected_for_next_round,
          result_published: submission.result_published,
        });
      }
    } catch (error) {
      // No submission or result not published
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wishlist")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .single();

      setIsInWishlist(!!data);
    } catch (error) {
      // Not in wishlist
    }
  };

  const trackView = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("recently_viewed").upsert(
        {
          user_id: user.id,
          event_id: id,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,event_id" }
      );
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const toggleWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isInWishlist) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("event_id", id);
        setIsInWishlist(false);
        toast({ title: "Removed from wishlist" });
      } else {
        await supabase.from("wishlist").insert({
          user_id: user.id,
          event_id: id,
        });
        setIsInWishlist(true);
        toast({ title: "Added to wishlist" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  const isDeadlinePassed = new Date(event.registration_deadline) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poster */}
            {event.poster_url && (
              <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <img
                  src={event.poster_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Result Display */}
            {submissionResult && (
              <Card className={`p-6 mb-6 ${submissionResult.is_selected ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {submissionResult.is_selected ? '🎉 Congratulations! You are Selected!' : '📋 Evaluation Complete'}
                    </h3>
                    <p className="text-muted-foreground">
                      {submissionResult.is_selected 
                        ? 'You have been selected for the next round!' 
                        : 'Your submission has been evaluated.'}
                    </p>
                    {submissionResult.rating !== undefined && submissionResult.rating !== null && (
                      <div className="mt-3">
                        <span className="text-sm font-medium">Your Rating: </span>
                        <span className="text-2xl font-bold">{submissionResult.rating}/100</span>
                      </div>
                    )}
                  </div>
                  <div className="text-4xl">
                    {submissionResult.is_selected ? '✅' : '📊'}
                  </div>
                </div>
              </Card>
            )}

            {/* Event Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                {event.organizer}
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {event.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>
                    Updated On: {new Date(event.event_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {event.prize_money && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg mt-4 flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <span className="text-lg font-semibold">
                    Prizes worth ₹{event.prize_money.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="stages" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="stages">Stages & Timeline</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="dates">Dates & Deadlines</TabsTrigger>
                <TabsTrigger value="prizes">Prizes</TabsTrigger>
              </TabsList>
              <TabsContent value="stages" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Stages and Timelines</h2>
                  <div className="prose max-w-none">
                    <p>{event.stages || "No stages information available"}</p>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="details" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Details</h2>
                  <div className="prose max-w-none">
                    <p>{event.details || event.description}</p>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="dates" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Dates & Deadlines</h2>
                  <div className="prose max-w-none">
                    <p>{event.dates_deadlines || "No dates information available"}</p>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="prizes" className="mt-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Prizes</h2>
                  <div className="prose max-w-none">
                    <p>{event.prizes || `Prizes worth ₹${event.prize_money?.toLocaleString() || 0}`}</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              {event.registration_fee > 0 && (
                <div className="text-3xl font-bold mb-4 text-primary">
                  ₹{event.registration_fee}
                </div>
              )}

              <div className="flex gap-2 mb-6">
                <Button
                  onClick={toggleWishlist}
                  variant="outline"
                  size="icon"
                  className={isInWishlist ? "text-red-500" : ""}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                </Button>
              </div>

              {isDeadlinePassed ? (
                <Button className="w-full" disabled>
                  Registration Closed
                </Button>
              ) : isRegistered ? (
                <Button className="w-full" disabled>
                  Registered
                </Button>
              ) : (
                <Link to={`/register/${event.id}`} className="block">
                  <Button className="w-full">Register Now</Button>
                </Link>
              )}

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Registered</span>
                  </div>
                  <span className="font-medium">
                    {event.registered_count} / {event.total_slots}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Team Size</span>
                  </div>
                  <span className="font-medium">
                    {event.team_size_min === event.team_size_max
                      ? `${event.team_size_min} ${
                          event.team_size_min === 1 ? "Member" : "Members"
                        }`
                      : `${event.team_size_min} - ${event.team_size_max} Members`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>Impressions</span>
                  </div>
                  <span className="font-medium">
                    {event.impressions.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Registration Deadline</span>
                  </div>
                  <span className="font-medium">
                    {new Date(event.registration_deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Eligibility</h3>
              <p className="text-sm text-muted-foreground">{event.eligibility}</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
