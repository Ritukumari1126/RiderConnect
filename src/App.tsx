import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LostFound from "./pages/LostFound";
import SearchTransport from "./pages/SearchTransport";
import CommunityChat from "./pages/CommunityChat";
import DriverProfile from "./pages/DriverProfile";
import DriverProfileView from "./pages/DriverProfileView";
import VehicleRentals from "./pages/VehicleRentals";
import BookVehicle from "./pages/BookVehicle";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/lost-found" element={<ProtectedRoute><AppLayout><LostFound /></AppLayout></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><AppLayout><SearchTransport /></AppLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AppLayout><CommunityChat /></AppLayout></ProtectedRoute>} />
            <Route path="/driver-profile" element={<ProtectedRoute><AppLayout><DriverProfile /></AppLayout></ProtectedRoute>} />
            <Route path="/driver/:id" element={<ProtectedRoute><AppLayout><DriverProfileView /></AppLayout></ProtectedRoute>} />
            <Route path="/rentals" element={<ProtectedRoute><AppLayout><VehicleRentals /></AppLayout></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><AppLayout><BookVehicle /></AppLayout></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><AppLayout><MyBookings /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
