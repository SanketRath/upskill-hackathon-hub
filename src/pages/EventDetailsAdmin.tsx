import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  organizer: string;
  event_date: string;
  registration_deadline: string;
  registration_fee: number;
  team_size_min: number;
  team_size_max: number;
  total_slots: number;
  registered_count: number;
  approval_status: string;
  submission_type: string;
  details?: string;
  eligibility?: string;
  prizes?: string;
  stages?: string;
  dates_deadlines?: string;
  prize_money?: number;
  rejection_reason?: string;
}

export default function EventDetailsAdmin() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: roleLoading } = useRoleCheck("admin");
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isAuthorized && eventId) {
      fetchEventDetails();
    }
  }, [isAuthorized, eventId]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
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

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ approval_status: "approved" })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event approved successfully",
      });
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error approving event:", error);
      toast({
        title: "Error",
        description: "Failed to approve event",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ 
          approval_status: "rejected",
          rejection_reason: rejectionReason.trim()
        })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event rejected",
      });
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast({
        title: "Error",
        description: "Failed to reject event",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized || !event) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                <p className="text-muted-foreground">{event.organizer}</p>
              </div>
              {getStatusBadge(event.approval_status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Event Type</Label>
                <p className="font-medium">{event.event_type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{event.location}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Event Date</Label>
                <p className="font-medium">
                  {format(new Date(event.event_date), "PPP")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Registration Deadline</Label>
                <p className="font-medium">
                  {format(new Date(event.registration_deadline), "PPP")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Team Size</Label>
                <p className="font-medium">
                  {event.team_size_min} - {event.team_size_max}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Registration Fee</Label>
                <p className="font-medium">₹{event.registration_fee}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Slots</Label>
                <p className="font-medium">{event.total_slots}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Registered</Label>
                <p className="font-medium">{event.registered_count}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Submission Type</Label>
                <p className="font-medium capitalize">{event.submission_type.replace('_', ' ')}</p>
              </div>
              {event.prize_money && (
                <div>
                  <Label className="text-muted-foreground">Prize Money</Label>
                  <p className="font-medium">₹{event.prize_money.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-2 whitespace-pre-wrap">{event.description}</p>
            </div>

            {event.details && (
              <div>
                <Label className="text-muted-foreground">Details</Label>
                <p className="mt-2 whitespace-pre-wrap">{event.details}</p>
              </div>
            )}

            {event.eligibility && (
              <div>
                <Label className="text-muted-foreground">Eligibility</Label>
                <p className="mt-2 whitespace-pre-wrap">{event.eligibility}</p>
              </div>
            )}

            {event.prizes && (
              <div>
                <Label className="text-muted-foreground">Prizes</Label>
                <p className="mt-2 whitespace-pre-wrap">{event.prizes}</p>
              </div>
            )}

            {event.stages && (
              <div>
                <Label className="text-muted-foreground">Stages</Label>
                <p className="mt-2 whitespace-pre-wrap">{event.stages}</p>
              </div>
            )}

            {event.rejection_reason && (
              <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950">
                <Label className="text-red-700 dark:text-red-300">Rejection Reason</Label>
                <p className="mt-2 text-red-900 dark:text-red-100">{event.rejection_reason}</p>
              </div>
            )}

            {event.approval_status === "pending" && (
              <div className="space-y-4 pt-6 border-t">
                <div>
                  <Label htmlFor="rejection-reason">
                    Rejection Reason (Required if rejecting)
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a detailed reason for rejection..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Event
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Event
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
