
ALTER TABLE public.vehicle_rentals 
ADD CONSTRAINT vehicle_rentals_driver_id_fkey 
FOREIGN KEY (driver_id) REFERENCES public.driver_profiles(id) ON DELETE CASCADE;
