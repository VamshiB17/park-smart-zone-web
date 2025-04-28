
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Slots from "./pages/Slots";
import Bookings from "./pages/Bookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSlots from "./pages/AdminSlots";
import AdminBookings from "./pages/AdminBookings";
import NotFound from "./pages/NotFound";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ParkingProvider } from "./contexts/ParkingContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ParkingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/slots" element={<AdminSlots />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ParkingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
