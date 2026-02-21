import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AssistantProvider } from "@/state/assistantStore";
import { AvatarButton } from "@/components/assistant/AvatarButton";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { AdminGuard } from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Fund from "./pages/Fund";
import Pitch from "./pages/Pitch";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Sandbox from "./pages/Sandbox";
import Demo from "./pages/Demo";
import Investor from "./pages/Investor";
import AdminAuth from "./pages/AdminAuth";
import AdminHome from "./pages/AdminHome";
import AdminWorkflows from "./pages/AdminWorkflows";
import AdminWorkflowDetail from "./pages/AdminWorkflowDetail";
import AdminBrand from "./pages/AdminBrand";
import AdminInvestorSettings from "./pages/AdminInvestorSettings";
import AdminTeam from "./pages/AdminTeam";
import AdminAuditLog from "./pages/AdminAuditLog";
import GlowCursor from "./components/GlowCursor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AssistantProvider>
          <GlowCursor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/investor" element={<Investor />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fund" element={<Fund />} />
              <Route path="/pitch" element={<Pitch />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin/login" element={<AdminAuth />} />
              {/* Unified admin shell with sidebar */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminHome />} />
                <Route path="workflows" element={<AdminWorkflows />} />
                <Route path="workflows/:id" element={<AdminWorkflowDetail />} />
                <Route path="brand" element={<AdminBrand />} />
                <Route path="investor" element={<AdminInvestorSettings />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="audit" element={<AdminAuditLog />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <AvatarButton />
          <AssistantPanel />
        </AssistantProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
