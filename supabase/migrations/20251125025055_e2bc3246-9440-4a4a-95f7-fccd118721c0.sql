-- Add policy to allow organizers to view registrations for their events
CREATE POLICY "Organizers can view registrations for their events"
ON public.registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM events
    JOIN organizers ON organizers.id = events.organizer_id
    WHERE events.id = registrations.event_id
    AND organizers.user_id = auth.uid()
  )
);

-- Add policy to allow organizers to view team members for their events
CREATE POLICY "Organizers can view team members for their events"
ON public.team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM registrations
    JOIN events ON events.id = registrations.event_id
    JOIN organizers ON organizers.id = events.organizer_id
    WHERE team_members.registration_id = registrations.id
    AND organizers.user_id = auth.uid()
  )
);