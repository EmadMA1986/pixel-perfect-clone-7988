import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RyaDashboard from "./pages/RyaDashboard";
import OtcDashboard from "./pages/OtcDashboard";
import MkAutosDashboard from "./pages/MkAutosDashboard";
import MkxDashboard from "./pages/MkxDashboard";
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
          <Route path="/mk-autos" element={<MkAutosDashboard />} />
          <Route path="/mkx" element={<MkxDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
