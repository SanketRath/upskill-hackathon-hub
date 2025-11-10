-- Add admin to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';

-- Add approval_status to events table for admin approval workflow
ALTER TABLE events ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create admin policies for events
CREATE POLICY "Admins can view all events" ON events
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all events" ON events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events" ON events
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create admin policies for user_roles
CREATE POLICY "Admins can view all user roles" ON user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles" ON user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add approval tracking fields to registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS organizer_approved boolean DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS approval_notes text;