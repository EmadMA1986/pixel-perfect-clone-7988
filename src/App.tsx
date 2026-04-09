import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RyaDashboard from "./pages/RyaDashboard";
import OtcDashboard from "./pages/OtcDashboard";
import MkAutosCarsDashboard from "./pages/MkAutosCarsDashboard";
import MkAutosCompanyDashboard from "./pages/MkAutosCompanyDashboard";
import MkxDashboard from "./pages/MkxDashboard";
import GarageDashboard from "./pages/GarageDashboard";
import CombinedDashboard from "./pages/CombinedDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RyaDashboard />} />
          <Route path="/otc" element={<OtcDashboard />} />
          <Route path="/mk-autos" element={<MkAutosCarsDashboard />} />
          <Route path="/mk-autos-company" element={<MkAutosCompanyDashboard />} />
          <Route path="/mkx" element={<MkxDashboard />} />
          <Route path="/garage" element={<GarageDashboard />} />
          <Route path="/portfolio" element={<CombinedDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
