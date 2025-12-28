import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

interface Company {
  id: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
  reviewCount: number;
  ratings: {
    service: number;
    price: number;
    speed: number;
    quality: number;
  };
}

const allCompanies: Company[] = [
  {
    id: "kapital-bank",
    name: "Kapital Bank",
    logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop",
    category: "Bank",
    rating: 4.5,
    reviewCount: 1247,
    ratings: { service: 4.6, price: 4.2, speed: 4.4, quality: 4.7 }
  },
  {
    id: "azercell",
    name: "Azercell",
    logo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop",
    category: "Telekommunikasiya",
    rating: 4.3,
    reviewCount: 2156,
    ratings: { service: 4.4, price: 3.9, speed: 4.5, quality: 4.3 }
  },
  {
    id: "pasha-bank",
    name: "PAŞA Bank",
    logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&h=100&fit=crop",
    category: "Bank",
    rating: 4.7,
    reviewCount: 892,
    ratings: { service: 4.8, price: 4.3, speed: 4.6, quality: 4.9 }
  },
  {
    id: "bakcell",
    name: "Bakcell",
    logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop",
    category: "Telekommunikasiya",
    rating: 4.1,
    reviewCount: 1834,
    ratings: { service: 4.2, price: 4.0, speed: 4.3, quality: 4.0 }
  },
  {
    id: "bravo",
    name: "Bravo",
    logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop",
    category: "Supermarket",
    rating: 4.4,
    reviewCount: 3421,
    ratings: { service: 4.3, price: 4.5, speed: 4.2, quality: 4.5 }
  },
  {
    id: "araz",
    name: "Araz",
    logo: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=100&h=100&fit=crop",
    category: "Supermarket",
    rating: 4.2,
    reviewCount: 2876,
    ratings: { service: 4.1, price: 4.6, speed: 4.0, quality: 4.2 }
  }
];

const ratingLabels: Record<string, string> = {
  service: "Xidmət",
  price: "Qiymət",
  speed: "Sürət",
  quality: "Keyfiyyət"
};

const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const ids = searchParams.get("companies")?.split(",") || [];
    const companies = ids
      .map(id => allCompanies.find(c => c.id === id))
      .filter(Boolean) as Company[];
    setSelectedCompanies(companies);
  }, [searchParams]);

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

  const getComparisonIndicator = (value: number, index: number, key: string) => {
    if (selectedCompanies.length < 2) return null;
    
    const values = selectedCompanies.map(c => c.ratings[key as keyof typeof c.ratings]);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    
    if (value === maxValue && maxValue !== minValue) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (value === minValue && maxValue !== minValue) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

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
          <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
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
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-20 h-20 rounded-xl mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{company.category}</p>
                <div className="flex justify-center">
                  <StarRating rating={company.rating} size="md" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {company.reviewCount} rəy
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
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => addCompany(company)}
                    >
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.category}</p>
                      </div>
                      <StarRating rating={company.rating} size="sm" />
                    </div>
                  ))}
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
                {Object.keys(ratingLabels).map((key) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{ratingLabels[key]}</span>
                    </div>
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedCompanies.length}, 1fr)` }}>
                      {selectedCompanies.map((company, index) => {
                        const value = company.ratings[key as keyof typeof company.ratings];
                        return (
                          <div key={company.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{company.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">{value.toFixed(1)}</span>
                                {getComparisonIndicator(value, index, key)}
                              </div>
                            </div>
                            <Progress value={value * 20} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Overall Rating */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">Ümumi Reytinq</span>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCompanies.length}, 1fr)` }}>
                    {selectedCompanies.map((company) => (
                      <div key={company.id} className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{company.name}</p>
                        <div className="flex justify-center mb-1">
                          <StarRating rating={company.rating} size="lg" />
                        </div>
                        <p className="text-sm text-muted-foreground">{company.reviewCount} rəy</p>
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
