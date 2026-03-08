
-- Sponsors table
CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  audio_url text,
  website_url text,
  position text NOT NULL DEFAULT 'footer',
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors are publicly readable" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Sponsor requests table (advertiser inquiries)
CREATE TABLE public.sponsor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  budget text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit sponsor request" ON public.sponsor_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read sponsor requests" ON public.sponsor_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sponsor requests" ON public.sponsor_requests FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for sponsor assets
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsors-assets', 'sponsors-assets', true);

CREATE POLICY "Admins can upload sponsor assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sponsors-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sponsor assets" ON storage.objects FOR DELETE USING (bucket_id = 'sponsors-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sponsor assets are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'sponsors-assets');
