-- Fix RLS policy for ads table to allow public reading of active ads
-- Run this SQL in your Supabase dashboard SQL editor

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can read active ads" ON public.ads;

-- Create proper policy for public reading of active ads
CREATE POLICY "Public can read active ads" 
ON public.ads 
FOR SELECT 
USING (
  is_active = true 
  AND (start_date IS NULL OR start_date <= now()) 
  AND (end_date IS NULL OR end_date >= now())
);

-- Ensure the policy for admin management still exists (drop first if exists)
DROP POLICY IF EXISTS "Only profile admins can manage ads" ON public.ads;

CREATE POLICY "Only profile admins can manage ads" 
ON public.ads 
FOR ALL 
USING (public.has_admin_role(auth.uid()))
WITH CHECK (public.has_admin_role(auth.uid()));
