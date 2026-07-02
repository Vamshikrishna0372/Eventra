import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChatbot from "./components/FloatingChatbot";
import { Loader2 } from "lucide-react";

// Lazy Load Pages
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const ExploreEvents = lazy(() => import("./pages/student/ExploreEvents"));
const EventDetails = lazy(() => import("./pages/student/EventDetails"));
const MyRegistrations = lazy(() => import("./pages/student/MyRegistrations"));
const MyTickets = lazy(() => import("./pages/student/MyTickets"));
const CoordinatorDashboard = lazy(() => import("./pages/coordinator/Dashboard"));
const CoordinatorEventDashboard = lazy(() => import("./pages/coordinator/CoordinatorEventDashboard"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const StudentCategories = lazy(() => import("./pages/student/Categories"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CreateEvent = lazy(() => import("./pages/admin/CreateEvent"));
const ManageEvents = lazy(() => import("./pages/admin/ManageEvents"));
const AdminRegistrations = lazy(() => import("./pages/admin/Registrations"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UniversalScanner = lazy(() => import("./pages/UniversalScanner"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
    <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Loading Eventra...</p>
  </div>
);

const App = () => (
  <GoogleOAuthProvider clientId="430328305712-uivbvt9pgftvtp2o3qktaflbhc49vgq6.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <TooltipProvider>
            <Sonner position="top-center" richColors />
            <FloatingChatbot />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Student Protected Routes */}
                    <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/student/explore" element={<ProtectedRoute><ExploreEvents /></ProtectedRoute>} />
                    <Route path="/student/registrations" element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>} />
                    <Route path="/student/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
                    <Route path="/scanner" element={<ProtectedRoute><UniversalScanner /></ProtectedRoute>} />
                    <Route path="/coordinator" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />
                    <Route path="/coordinator/dashboard" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />
                    <Route path="/coordinator/event/:eventId" element={<ProtectedRoute><CoordinatorEventDashboard /></ProtectedRoute>} />
                    <Route path="/student/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
                    <Route path="/student/categories" element={<ProtectedRoute><StudentCategories /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    <Route path="/student/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    
                    {/* Admin Protected Routes */}
                    <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/create" element={<ProtectedRoute allowedRoles={["admin"]}><CreateEvent /></ProtectedRoute>} />
                    <Route path="/admin/manage" element={<ProtectedRoute allowedRoles={["admin"]}><ManageEvents /></ProtectedRoute>} />
                    <Route path="/admin/registrations" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRegistrations /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><Analytics /></ProtectedRoute>} />
                    <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCategories /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
                    
                    {/* Other Routes */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
