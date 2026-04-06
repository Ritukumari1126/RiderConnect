
-- Vehicle rental listings by drivers
CREATE TABLE public.vehicle_rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  user_id UUID NOT NULL,
  vehicle_type TEXT NOT NULL,
  from_state TEXT,
  from_district TEXT,
  from_location TEXT,
  to_state TEXT,
  to_district TEXT,
  to_location TEXT,
  price_per_day NUMERIC,
  description TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle rentals viewable by everyone" ON public.vehicle_rentals FOR SELECT USING (true);
CREATE POLICY "Drivers can insert own rentals" ON public.vehicle_rentals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Drivers can update own rentals" ON public.vehicle_rentals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Drivers can delete own rentals" ON public.vehicle_rentals FOR DELETE USING (auth.uid() = user_id);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES public.vehicle_rentals(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  rider_name TEXT NOT NULL,
  rider_phone TEXT,
  purpose TEXT,
  booking_date DATE NOT NULL,
  from_location TEXT,
  to_location TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookings viewable by involved parties" ON public.bookings FOR SELECT USING (auth.uid() = rider_id OR auth.uid() = driver_id);
CREATE POLICY "Riders can insert bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = rider_id);
CREATE POLICY "Involved parties can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = rider_id OR auth.uid() = driver_id);
CREATE POLICY "Riders can delete own bookings" ON public.bookings FOR DELETE USING (auth.uid() = rider_id);

-- Add triggers for updated_at
CREATE TRIGGER update_vehicle_rentals_updated_at BEFORE UPDATE ON public.vehicle_rentals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_rentals;
