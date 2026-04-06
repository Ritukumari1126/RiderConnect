
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'rider' CHECK (role IN ('rider', 'driver')),
  profile_photo_url TEXT,
  state TEXT,
  district TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, profile_photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'rider'),
    NEW.raw_user_meta_data->>'profile_photo_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Driver profiles table
CREATE TABLE public.driver_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT NOT NULL,
  license_number TEXT,
  transport_number TEXT,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('auto', 'bus', 'other')),
  from_location TEXT,
  to_location TEXT,
  from_state TEXT,
  from_district TEXT,
  to_state TEXT,
  to_district TEXT,
  about TEXT,
  profile_photo_url TEXT,
  license_photo_url TEXT,
  rating NUMERIC DEFAULT 0,
  trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Driver profiles are viewable by everyone" ON public.driver_profiles FOR SELECT USING (true);
CREATE POLICY "Drivers can insert own profile" ON public.driver_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Drivers can update own profile" ON public.driver_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON public.driver_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lost items table
CREATE TABLE public.lost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  state TEXT,
  district TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'found')),
  item_photo_url TEXT,
  reporter_name TEXT,
  reporter_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lost items are viewable by everyone" ON public.lost_items FOR SELECT USING (true);
CREATE POLICY "Users can insert lost items" ON public.lost_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lost items" ON public.lost_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lost items" ON public.lost_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_lost_items_updated_at BEFORE UPDATE ON public.lost_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  avatar_url TEXT,
  state TEXT,
  district TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages are viewable by everyone" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('license-photos', 'license-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-item-photos', 'lost-item-photos', true);

-- Storage policies
CREATE POLICY "Profile photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can upload profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "Users can update profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos');

CREATE POLICY "License photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'license-photos');
CREATE POLICY "Users can upload license photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'license-photos');

CREATE POLICY "Lost item photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'lost-item-photos');
CREATE POLICY "Users can upload lost item photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lost-item-photos');
