-- Create function to increment registered count
CREATE OR REPLACE FUNCTION increment_registered_count(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET registered_count = registered_count + 1
  WHERE id = event_id;
END;
$$;