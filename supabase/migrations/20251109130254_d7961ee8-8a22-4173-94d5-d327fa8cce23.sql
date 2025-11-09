-- Add RLS policies to allow team members to view and update their own data
-- This fixes the team_members PII exposure issue

-- Allow team members to view their own data by matching their email
CREATE POLICY "Team members can view their own data"
ON public.team_members
FOR SELECT
USING (auth.jwt() ->> 'email' = email);

-- Allow team members to update their own data
CREATE POLICY "Team members can update their own data"
ON public.team_members
FOR UPDATE
USING (auth.jwt() ->> 'email' = email);

-- Allow team members to delete their own data (opt-out from teams)
CREATE POLICY "Team members can delete their own data"
ON public.team_members
FOR DELETE
USING (auth.jwt() ->> 'email' = email);