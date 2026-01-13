import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, TrendingUp, TrendingDown, Minus, Loader2, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  average_rating: number | null;
  review_count: number | null;
}

const ratingLabels: Record<string, string> = {
  overall: "Ümumi Reytinq",
};

const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (allCompanies.length > 0) {
      const ids = searchParams.get("companies")?.split(",").filter(Boolean) || [];
      const companies = ids
        .map(id => allCompanies.find(c => c.id === id))
        .filter(Boolean) as Company[];
      setSelectedCompanies(companies);
    }
  }, [searchParams, allCompanies]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url, category, average_rating, review_count")
        .eq("status", "approved")
        .order("name");

      if (error) throw error;
      setAllCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = (company: Company) => {
    if (selectedCompanies.length >= 3) return;
    if (selectedCompanies.find(c => c.id === company.id)) return;
    
    const newCompanies = [...selectedCompanies, company];
    setSelectedCompanies(newCompanies);
    setSearchParams({ companies: newCompanies.map(c => c.id).join(",") });
    setIsDialogOpen(false);
    setSearchQuery("");
  };

  const removeCompany = (companyId: string) => {
    const newCompanies = selectedCompanies.filter(c => c.id !== companyId);
    setSelectedCompanies(newCompanies);
    if (newCompanies.length > 0) {
      setSearchParams({ companies: newCompanies.map(c => c.id).join(",") });
    } else {
      setSearchParams({});
    }
  };

  const filteredCompanies = allCompanies.filter(
    c => 
      !selectedCompanies.find(sc => sc.id === c.id) &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getComparisonIndicator = (value: number, allValues: number[]) => {
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    
    if (value === maxValue && maxValue !== minValue) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (value === minValue && maxValue !== minValue) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/search')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Axtarışa qayıt
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">
            Şirkət Müqayisəsi
          </h1>
          <p className="text-muted-foreground">
            2-3 şirkəti seçib reytinqlərini müqayisə edin
          </p>
        </div>

        {/* Company Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {selectedCompanies.map((company) => (
            <Card key={company.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => removeCompany(company.id)}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6 text-center">
                <div className="w-20 h-20 rounded-xl mx-auto mb-4 bg-white border border-border flex items-center justify-center overflow-hidden">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{company.category}</p>
                <div className="flex justify-center">
                  <StarRating rating={company.average_rating || 0} size="md" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {company.review_count || 0} rəy
                </p>
              </CardContent>
            </Card>
          ))}
          
          {selectedCompanies.length < 3 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[220px]">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Şirkət əlavə et</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Müqayisəyə şirkət əlavə et</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Şirkət axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredCompanies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Şirkət tapılmadı
                    </p>
                  ) : (
                    filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => addCompany(company)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.category}</p>
                        </div>
                        <StarRating rating={company.average_rating || 0} size="sm" />
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Comparison Table */}
        {selectedCompanies.length >= 2 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-6">Reytinq Müqayisəsi</h2>
              
              <div className="space-y-6">
                {/* Overall Rating Comparison */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Ümumi Reytinq</span>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedCompanies.length}, 1fr)` }}>
                    {selectedCompanies.map((company) => {
                      const value = company.average_rating || 0;
                      const allValues = selectedCompanies.map(c => c.average_rating || 0);
                      return (
                        <div key={company.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{company.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{value.toFixed(1)}</span>
                              {getComparisonIndicator(value, allValues)}
                            </div>
                          </div>
                          <Progress value={value * 20} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Count Comparison */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Rəy Sayı</span>
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedCompanies.length}, 1fr)` }}>
                    {selectedCompanies.map((company) => {
                      const value = company.review_count || 0;
                      const allValues = selectedCompanies.map(c => c.review_count || 0);
                      const maxValue = Math.max(...allValues);
                      return (
                        <div key={company.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{company.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{value.toLocaleString()}</span>
                              {getComparisonIndicator(value, allValues)}
                            </div>
                          </div>
                          <Progress value={maxValue > 0 ? (value / maxValue) * 100 : 0} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-lg">Xülasə</span>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCompanies.length}, 1fr)` }}>
                    {selectedCompanies.map((company) => (
                      <div key={company.id} className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{company.name}</p>
                        <div className="flex justify-center mb-1">
                          <StarRating rating={company.average_rating || 0} size="lg" />
                        </div>
                        <p className="text-sm text-muted-foreground">{company.review_count || 0} rəy</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedCompanies.length < 2 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Müqayisə etmək üçün ən azı 2 şirkət seçin
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ComparePage;
