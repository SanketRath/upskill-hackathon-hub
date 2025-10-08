-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  college_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  passout_year INTEGER NOT NULL,
  heard_from TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL,
  prize_money INTEGER,
  team_size_min INTEGER NOT NULL DEFAULT 1,
  team_size_max INTEGER NOT NULL DEFAULT 1,
  registration_fee INTEGER NOT NULL DEFAULT 0,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL DEFAULT 'Everyone can apply',
  stages TEXT,
  details TEXT,
  dates_deadlines TEXT,
  prizes TEXT,
  tags TEXT[] DEFAULT '{}',
  poster_url TEXT,
  registered_count INTEGER NOT NULL DEFAULT 0,
  total_slots INTEGER NOT NULL DEFAULT 2000,
  impressions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events (publicly readable)
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own registrations" 
ON public.registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college_name TEXT NOT NULL,
  is_leader BOOLEAN NOT NULL DEFAULT false,
  photo_url TEXT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their team members" 
ON public.team_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.registrations 
  WHERE registrations.id = team_members.registration_id 
  AND registrations.user_id = auth.uid()
));

CREATE POLICY "Users can insert their team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.registrations 
  WHERE registrations.id = team_members.registration_id 
  AND registrations.user_id = auth.uid()
));

-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their wishlist" 
ON public.wishlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their wishlist" 
ON public.wishlist 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create recently viewed table
CREATE TABLE public.recently_viewed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their recently viewed" 
ON public.recently_viewed 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their recently viewed" 
ON public.recently_viewed 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their recently viewed" 
ON public.recently_viewed 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();