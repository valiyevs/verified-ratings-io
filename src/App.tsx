import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import CompanyPage from "./pages/CompanyPage";
import SearchPage from "./pages/SearchPage";
import SurveysPage from "./pages/SurveysPage";
import SurveyDetailPage from "./pages/SurveyDetailPage";
import CreateSurveyPage from "./pages/CreateSurveyPage";
import ComparePage from "./pages/ComparePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/company/:companyId" element={<CompanyPage />} />
            <Route path="/surveys" element={<SurveysPage />} />
            <Route path="/surveys/create" element={<CreateSurveyPage />} />
            <Route path="/surveys/:surveyId" element={<SurveyDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
