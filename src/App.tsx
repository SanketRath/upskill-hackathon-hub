import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import UserInfo from "./pages/UserInfo";
import Home from "./pages/Home";
import Competitions from "./pages/Competitions";
import EventDetails from "./pages/EventDetails";
import Registration from "./pages/Registration";
import MyRegistrations from "./pages/MyRegistrations";
import NotFound from "./pages/NotFound";

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
          <Route path="/home" element={<Home />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/register/:id" element={<Registration />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
