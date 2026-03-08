
-- =============================================
-- 1. ENUM & UTILITY FUNCTION
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- 2. PROFILES TABLE
-- =============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 3. USER ROLES TABLE
-- =============================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. RADIO CONFIG TABLE
-- =============================================

CREATE TABLE public.radio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Radio config is publicly readable" ON public.radio_config FOR SELECT USING (true);
CREATE POLICY "Admins can update radio config" ON public.radio_config FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert radio config" ON public.radio_config FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_radio_config_updated_at BEFORE UPDATE ON public.radio_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. SHOWS TABLE
-- =============================================

CREATE TABLE public.shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shows are publicly readable" ON public.shows FOR SELECT USING (true);
CREATE POLICY "Admins can manage shows" ON public.shows FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. EPISODES TABLE
-- =============================================

CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID REFERENCES public.shows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Episodes are publicly readable" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Admins can manage episodes" ON public.episodes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. CHAT MESSAGES TABLE (realtime)
-- =============================================

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages are publicly readable" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any message" ON public.chat_messages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- =============================================
-- 8. CHAT REACTIONS TABLE (realtime)
-- =============================================

CREATE TABLE public.chat_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are publicly readable" ON public.chat_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.chat_reactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;

-- =============================================
-- 9. FEEDBACKS TABLE
-- =============================================

CREATE TABLE public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedbacks are publicly readable" ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post feedback" ON public.feedbacks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.feedbacks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feedback" ON public.feedbacks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any feedback" ON public.feedbacks FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 10. STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('episodes-audio', 'episodes-audio', true);

CREATE POLICY "Episode audio files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'episodes-audio');
CREATE POLICY "Admins can upload episode audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'episodes-audio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update episode audio" ON storage.objects FOR UPDATE USING (bucket_id = 'episodes-audio' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete episode audio" ON storage.objects FOR DELETE USING (bucket_id = 'episodes-audio' AND public.has_role(auth.uid(), 'admin'));
