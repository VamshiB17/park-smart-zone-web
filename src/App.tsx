
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Slots from "./pages/Slots";
import Bookings from "./pages/Bookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSlots from "./pages/AdminSlots";
import AdminBookings from "./pages/AdminBookings";
import Help from "./pages/Help";
import Feedback from "./pages/Feedback";
import QRScannerPage from "./pages/QRScanner";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/slots" element={<Slots />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/qr-scanner" element={<QRScannerPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/slots" element={<AdminSlots />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
