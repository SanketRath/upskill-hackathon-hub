-- Add submission type and rejection reason to events
ALTER TABLE public.events 
ADD COLUMN submission_type text DEFAULT 'none' CHECK (submission_type IN ('none', 'github_link', 'zip_file', 'both')),
ADD COLUMN rejection_reason text;

-- Create submissions table
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  github_link text,
  file_url text,
  submitted_at timestamp with time zone DEFAULT now(),
  rating integer CHECK (rating >= 0 AND rating <= 100),
  is_selected_for_next_round boolean DEFAULT false,
  evaluation_notes text,
  result_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(registration_id, event_id)
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Participants can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON public.submissions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.registrations
    WHERE registrations.id = registration_id
    AND registrations.user_id = auth.uid()
  )
);

-- Participants can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.registrations
    WHERE registrations.id = registration_id
    AND registrations.user_id = auth.uid()
  )
);

-- Participants can update their own submissions (before evaluation)
CREATE POLICY "Users can update their own submissions"
ON public.submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.registrations
    WHERE registrations.id = registration_id
    AND registrations.user_id = auth.uid()
  )
  AND rating IS NULL
);

-- Organizers can view submissions for their events
CREATE POLICY "Organizers can view submissions for their events"
ON public.submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    JOIN public.organizers ON organizers.id = events.organizer_id
    WHERE events.id = event_id
    AND organizers.user_id = auth.uid()
  )
);

-- Organizers can update submissions for their events (ratings, selection)
CREATE POLICY "Organizers can update submissions for their events"
ON public.submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events
    JOIN public.organizers ON organizers.id = events.organizer_id
    WHERE events.id = event_id
    AND organizers.user_id = auth.uid()
  )
);

-- Create storage bucket for submission files
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false);

-- Storage policies for submissions
CREATE POLICY "Users can upload their submission files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own submission files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Organizers can view submission files for their events"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'submissions'
);

-- Add trigger for submissions updated_at
CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();