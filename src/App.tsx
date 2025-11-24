import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import UserInfo from "./pages/UserInfo";
import OrganizerInfo from "./pages/OrganizerInfo";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateEvent from "./pages/CreateEvent";
import Home from "./pages/Home";
import Competitions from "./pages/Competitions";
import EventDetails from "./pages/EventDetails";
import Registration from "./pages/Registration";
import MyRegistrations from "./pages/MyRegistrations";
import NotFound from "./pages/NotFound";
import EventDetailsAdmin from "./pages/EventDetailsAdmin";
import SubmitProject from "./pages/SubmitProject";
import ReviewSubmissions from "./pages/ReviewSubmissions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/organizer-info" element={<OrganizerInfo />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/home" element={<Home />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/register/:id" element={<Registration />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/admin/event/:eventId" element={<EventDetailsAdmin />} />
          <Route path="/submit-project/:eventId" element={<SubmitProject />} />
          <Route path="/review-submissions/:eventId" element={<ReviewSubmissions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
