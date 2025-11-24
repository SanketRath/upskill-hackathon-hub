import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";

interface Event {
  id: string;
  title: string;
  submission_type: string;
}

interface Registration {
  id: string;
}

interface Submission {
  id: string;
  github_link?: string;
  file_url?: string;
  rating?: number;
  is_selected_for_next_round: boolean;
  result_published: boolean;
}

export default function SubmitProject() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [githubLink, setGithubLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, title, submission_type")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch registration
      const { data: regData, error: regError } = await supabase
        .from("registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (regError) throw regError;
      setRegistration(regData);

      // Check for existing submission
      const { data: subData } = await supabase
        .from("submissions")
        .select("*")
        .eq("registration_id", regData.id)
        .eq("event_id", eventId)
        .maybeSingle();

      if (subData) {
        setSubmission(subData);
        setGithubLink(subData.github_link || "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registration || !event) return;

    const needsGithub = event.submission_type === "github_link" || event.submission_type === "both";
    const needsFile = event.submission_type === "zip_file" || event.submission_type === "both";

    if (needsGithub && !githubLink.trim()) {
      toast({
        title: "Required",
        description: "Please provide a GitHub link",
        variant: "destructive",
      });
      return;
    }

    if (needsFile && !file && !submission?.file_url) {
      toast({
        title: "Required",
        description: "Please upload a file",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileUrl = submission?.file_url;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${eventId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("submissions")
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      // Insert or update submission
      const submissionData = {
        registration_id: registration.id,
        event_id: eventId,
        github_link: githubLink.trim() || null,
        file_url: fileUrl,
      };

      if (submission) {
        const { error } = await supabase
          .from("submissions")
          .update(submissionData)
          .eq("id", submission.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("submissions")
          .insert(submissionData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Project submitted successfully",
      });
      navigate("/my-registrations");
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "Failed to submit project",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!event || !registration) {
    return null;
  }

  const canEdit = !submission || !submission.rating;
  const showGithub = event.submission_type === "github_link" || event.submission_type === "both";
  const showFile = event.submission_type === "zip_file" || event.submission_type === "both";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-registrations")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registrations
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Submit Project - {event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {submission?.result_published && (
              <div className={`mb-6 p-4 rounded-lg ${submission.is_selected_for_next_round ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                <h3 className="font-semibold mb-2">Result Published</h3>
                <p className={submission.is_selected_for_next_round ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {submission.is_selected_for_next_round 
                    ? '🎉 Congratulations! You have been selected for the next round.'
                    : 'Thank you for participating. Unfortunately, you were not selected for the next round.'}
                </p>
                {submission.rating !== null && (
                  <p className="mt-2">Your rating: {submission.rating}/100</p>
                )}
              </div>
            )}

            {!canEdit && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-300">
                  Your submission has been evaluated and cannot be modified.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {showGithub && (
                <div>
                  <Label htmlFor="github-link">
                    <LinkIcon className="inline mr-2 h-4 w-4" />
                    GitHub Repository Link
                  </Label>
                  <Input
                    id="github-link"
                    type="url"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    disabled={!canEdit}
                    className="mt-2"
                  />
                </div>
              )}

              {showFile && (
                <div>
                  <Label htmlFor="file-upload">
                    <Upload className="inline mr-2 h-4 w-4" />
                    Upload Project File (ZIP)
                  </Label>
                  {submission?.file_url && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Current file uploaded. Upload a new file to replace it.
                    </p>
                  )}
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    disabled={!canEdit}
                    className="mt-2"
                  />
                </div>
              )}

              {canEdit && (
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : submission ? "Update Submission" : "Submit Project"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
