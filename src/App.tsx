
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";
import { ParkingProvider } from "@/contexts/ParkingContext";
import { FeedbackProvider } from "@/contexts/FeedbackContext";

// Auth Components
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
      <AuthProvider>
        <ParkingProvider>
          <FeedbackProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/slots" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <Slots />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <Bookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <Feedback />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/qr-scanner" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <QRScannerPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <Help />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/slots" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSlots />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/bookings" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminBookings />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </FeedbackProvider>
        </ParkingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
