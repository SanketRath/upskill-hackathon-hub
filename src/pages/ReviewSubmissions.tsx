import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Download, ExternalLink, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  github_link?: string;
  file_url?: string;
  rating?: number;
  is_selected_for_next_round: boolean;
  evaluation_notes?: string;
  registration_id: string;
  registrations: {
    team_name?: string;
    team_members: Array<{
      name: string;
      is_leader: boolean;
    }>;
  };
}

export default function ReviewSubmissions() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: roleLoading } = useRoleCheck("organizer");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rating, setRating] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    if (isAuthorized && eventId) {
      fetchSubmissions();
    }
  }, [isAuthorized, eventId]);

  const fetchSubmissions = async () => {
    try {
      const { data: eventData } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();

      if (eventData) setEventTitle(eventData.title);

      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          registrations!inner (
            team_name,
            team_members (
              name,
              is_leader
            )
          )
        `)
        .eq("event_id", eventId);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (submission: Submission) => {
    setSelectedSubmission(submission);
    setRating(submission.rating?.toString() || "");
    setIsSelected(submission.is_selected_for_next_round);
    setNotes(submission.evaluation_notes || "");
  };

  const handleSaveEvaluation = async () => {
    if (!selectedSubmission) return;

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 100) {
      toast({
        title: "Invalid Rating",
        description: "Rating must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          rating: ratingNum,
          is_selected_for_next_round: isSelected,
          evaluation_notes: notes.trim() || null,
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Evaluation saved successfully",
      });
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast({
        title: "Error",
        description: "Failed to save evaluation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResults = async () => {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ result_published: true })
        .eq("event_id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Results published successfully",
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Error publishing results:", error);
      toast({
        title: "Error",
        description: "Failed to publish results",
        variant: "destructive",
      });
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return sortOrder === "asc" ? ratingA - ratingB : ratingB - ratingA;
  });

  const getTeamName = (submission: Submission) => {
    const leader = submission.registrations.team_members.find(m => m.is_leader);
    return submission.registrations.team_name || leader?.name || "Unknown Team";
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/organizer-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Review Submissions - {eventTitle}</CardTitle>
              <Button onClick={handlePublishResults}>
                Publish Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No submissions yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>GitHub</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="cursor-pointer" onClick={toggleSort}>
                      <div className="flex items-center">
                        Rating
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {getTeamName(submission)}
                      </TableCell>
                      <TableCell>
                        {submission.github_link ? (
                          <a
                            href={submission.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Link
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.file_url ? (
                          <a
                            href={submission.file_url}
                            download
                            className="text-blue-500 hover:underline flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.rating !== null ? submission.rating : "-"}
                      </TableCell>
                      <TableCell>
                        {submission.is_selected_for_next_round ? "✓" : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleEvaluate(submission)}
                        >
                          Evaluate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Evaluate Submission - {selectedSubmission && getTeamName(selectedSubmission)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating (0-100)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="100"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selected"
                  checked={isSelected}
                  onCheckedChange={(checked) => setIsSelected(checked as boolean)}
                />
                <Label htmlFor="selected">
                  Selected for next round
                </Label>
              </div>
              <div>
                <Label htmlFor="notes">Evaluation Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this submission..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvaluation} disabled={saving}>
                {saving ? "Saving..." : "Save Evaluation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
