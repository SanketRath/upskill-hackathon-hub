import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy, Upload, CheckCircle } from "lucide-react";

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
    submission_type: string;
  };
  submissions?: Array<{
    id: string;
    rating?: number;
    is_selected_for_next_round: boolean;
    result_published: boolean;
  }>;
}

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        .select(`
          *,
          events(*),
          submissions(*)
        `)
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

  const hasSubmission = (registration: Registration) => {
    return registration.submissions && registration.submissions.length > 0;
  };

  const getSubmissionStatus = (registration: Registration) => {
    if (!hasSubmission(registration)) return null;
    const submission = registration.submissions![0];
    
    if (submission.result_published) {
      return {
        label: submission.is_selected_for_next_round ? "Selected" : "Not Selected",
        variant: (submission.is_selected_for_next_round ? "default" : "secondary") as "default" | "secondary",
      };
    }
    
    if (submission.rating !== null) {
      return { label: "Evaluated", variant: "secondary" as "default" | "secondary" };
    }
    
    return { label: "Submitted", variant: "secondary" as "default" | "secondary" };
  };

  const needsSubmission = (registration: Registration) => {
    return registration.events.submission_type !== "none" && !hasSubmission(registration);
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
            {registrations.map((registration) => {
              const submissionStatus = getSubmissionStatus(registration);
              
              return (
                <Card key={registration.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <Link to={`/event/${registration.event_id}`}>
                    <CardHeader>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant="default">{registration.status}</Badge>
                        {submissionStatus && (
                          <Badge variant={submissionStatus.variant}>
                            {submissionStatus.label}
                          </Badge>
                        )}
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
                    <CardContent className="space-y-2 flex-1">
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
                  </Link>
                   
                  {/* Result Display */}
                  {hasSubmission(registration) && registration.submissions![0].result_published && (
                    <CardFooter className="border-t pt-4">
                      <div className={`w-full p-4 rounded-lg ${registration.submissions![0].is_selected_for_next_round ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        <div className="text-sm font-semibold mb-1">
                          {registration.submissions![0].is_selected_for_next_round ? '✅ Selected for Next Round!' : '📊 Evaluated'}
                        </div>
                        {registration.submissions![0].rating !== undefined && registration.submissions![0].rating !== null && (
                          <div className="text-xs text-muted-foreground">
                            Rating: <span className="font-bold">{registration.submissions![0].rating}/100</span>
                          </div>
                        )}
                      </div>
                    </CardFooter>
                  )}
                  
                  {registration.events.submission_type !== "none" && !hasSubmission(registration) && (
                    <CardFooter className="border-t pt-4">
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/submit-project/${registration.event_id}`)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Project
                      </Button>
                    </CardFooter>
                  )}
                  
                  {hasSubmission(registration) && !registration.submissions![0].result_published && (
                    <CardFooter className="border-t pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/submit-project/${registration.event_id}`)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        View Submission
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRegistrations;
