import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CompanyPage from "./pages/CompanyPage";
import SearchPage from "./pages/SearchPage";
import SurveysPage from "./pages/SurveysPage";
import SurveyDetailPage from "./pages/SurveyDetailPage";
import CreateSurveyPage from "./pages/CreateSurveyPage";
import SurveyResultsPage from "./pages/SurveyResultsPage";
import ComparePage from "./pages/ComparePage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import AddCompanyPage from "./pages/AddCompanyPage";
import BusinessDashboard from "./pages/BusinessDashboard";
import PricingPage from "./pages/PricingPage";
import DashboardPage from "./pages/DashboardPage";
import MyCompaniesPage from "./pages/MyCompaniesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
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
              <Route path="/surveys/:surveyId/results" element={<SurveyResultsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/add-company" element={<AddCompanyPage />} />
              <Route path="/business-dashboard/:companyId" element={<BusinessDashboard />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-companies" element={<MyCompaniesPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
