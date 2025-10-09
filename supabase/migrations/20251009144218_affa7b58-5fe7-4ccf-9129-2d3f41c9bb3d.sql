-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'organizer', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create organizers table
CREATE TABLE public.organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on organizers
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizers
CREATE POLICY "Organizers can view their own profile"
  ON public.organizers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Organizers can insert their own profile"
  ON public.organizers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update their own profile"
  ON public.organizers FOR UPDATE
  USING (auth.uid() = user_id);

-- Add organizer_id to events table
ALTER TABLE public.events ADD COLUMN organizer_id UUID REFERENCES public.organizers(id);

-- Update events RLS policies for organizers
CREATE POLICY "Organizers can insert their own events"
  ON public.events FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'organizer'));

CREATE POLICY "Organizers can update their own events"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizers
      WHERE organizers.id = events.organizer_id
      AND organizers.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can view their own events"
  ON public.events FOR SELECT
  USING (
    true OR
    EXISTS (
      SELECT 1 FROM public.organizers
      WHERE organizers.id = events.organizer_id
      AND organizers.user_id = auth.uid()
    )
  );

-- Add custom_sections to events table (JSONB to store dynamic sections)
ALTER TABLE public.events ADD COLUMN custom_sections JSONB DEFAULT '[]'::jsonb;

-- Trigger for organizers updated_at
CREATE TRIGGER update_organizers_updated_at
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();