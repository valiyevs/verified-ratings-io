import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Globe, 
  MessageSquare,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";

// Test data
const companiesData: Record<string, {
  id: string;
  name: string;
  category: string;
  logo: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  description: string;
  address: string;
  phone: string;
  website: string;
  established: string;
  employees: string;
  ratings: { label: string; value: number }[];
  reviews: {
    id: string;
    author: string;
    date: string;
    rating: number;
    text: string;
    helpful: number;
    hasReceipt: boolean;
  }[];
}> = {
  "kapital-bank": {
    id: "kapital-bank",
    name: "Kapital Bank",
    category: "Bank",
    logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&h=200&fit=crop",
    rating: 4.5,
    reviewCount: 3245,
    verified: true,
    description: "Azərbaycanın aparıcı özəl banklarından biri. Fiziki və hüquqi şəxslərə geniş çeşidli bank xidmətləri təqdim edir.",
    address: "Bakı, Nizami küçəsi 67",
    phone: "+994 12 310 00 00",
    website: "www.kapitalbank.az",
    established: "1998",
    employees: "3000+",
    ratings: [
      { label: "Xidmət keyfiyyəti", value: 4.6 },
      { label: "Qiymət/Dəyər", value: 4.2 },
      { label: "Sürət", value: 4.5 },
      { label: "Müştəri dəstəyi", value: 4.7 },
    ],
    reviews: [
      {
        id: "1",
        author: "Əli M.",
        date: "15 Dekabr 2024",
        rating: 5,
        text: "Müştəri xidməti çox yaxşılaşıb. Mobil tətbiq əla işləyir, köçürmələr anında icra olunur. Xüsusilə BirBank tətbiqini çox bəyənirəm.",
        helpful: 24,
        hasReceipt: true,
      },
      {
        id: "2",
        author: "Leyla R.",
        date: "10 Dekabr 2024",
        rating: 4,
        text: "Kredit prosesi çox rahat keçdi. Sənədləşmə online baş tutdu. Amma faiz dərəcələri bir az yüksəkdir.",
        helpful: 18,
        hasReceipt: true,
      },
      {
        id: "3",
        author: "Orxan H.",
        date: "5 Dekabr 2024",
        rating: 5,
        text: "Filialda növbə sistemi yaxşı işləyir. İşçilər çox səmimi və köməkçidir. Tövsiyə edirəm.",
        helpful: 12,
        hasReceipt: false,
      },
    ],
  },
  "azercell": {
    id: "azercell",
    name: "Azercell",
    category: "Telekommunikasiya",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop",
    rating: 4.2,
    reviewCount: 5678,
    verified: true,
    description: "Azərbaycanın ilk mobil operatoru. 4G/LTE şəbəkəsi ilə yüksək sürətli internet xidməti göstərir.",
    address: "Bakı, Tbilisi prospekti 80",
    phone: "*7777",
    website: "www.azercell.com",
    established: "1996",
    employees: "1500+",
    ratings: [
      { label: "Şəbəkə keyfiyyəti", value: 4.4 },
      { label: "Qiymət/Dəyər", value: 3.8 },
      { label: "Müştəri dəstəyi", value: 4.0 },
      { label: "Tətbiq/Texnologiya", value: 4.5 },
    ],
    reviews: [
      {
        id: "1",
        author: "Rəşad K.",
        date: "18 Dekabr 2024",
        rating: 4,
        text: "İnternet sürəti stabil, amma tarif paketləri bir az bahadır. LTE əhatəsi Bakıda əladır.",
        helpful: 32,
        hasReceipt: false,
      },
      {
        id: "2",
        author: "Nigar A.",
        date: "12 Dekabr 2024",
        rating: 5,
        text: "Kabinetim tətbiqi çox rahatdır. Bütün əməliyyatları oradan edirəm. Tövsiyə edirəm.",
        helpful: 21,
        hasReceipt: true,
      },
    ],
  },
};

// Default company for unknown IDs
const defaultCompany = {
  id: "default",
  name: "Şirkət",
  category: "Ümumi",
  logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
  rating: 4.0,
  reviewCount: 100,
  verified: false,
  description: "Şirkət haqqında məlumat əldə edilir...",
  address: "Bakı, Azərbaycan",
  phone: "+994 XX XXX XX XX",
  website: "www.example.com",
  established: "2020",
  employees: "50+",
  ratings: [
    { label: "Xidmət keyfiyyəti", value: 4.0 },
    { label: "Qiymət/Dəyər", value: 4.0 },
    { label: "Sürət", value: 4.0 },
    { label: "Müştəri dəstəyi", value: 4.0 },
  ],
  reviews: [],
};

const CompanyPage = () => {
  const { companyId } = useParams();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const company = companiesData[companyId || ""] || { ...defaultCompany, name: companyId?.replace("-", " ") || "Şirkət" };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Əsas səhifəyə qayıt
          </Link>

          {/* Company Header */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card mb-8 border border-border/50">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-secondary overflow-hidden flex-shrink-0">
                <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {company.name}
                  </h1>
                  {company.verified && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-sm">{company.category}</Badge>
                  <div className="flex items-center gap-2">
                    <StarRating rating={company.rating} size="lg" />
                    <span className="text-muted-foreground">({company.reviewCount} rəy)</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 max-w-2xl">
                  {company.description}
                </p>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {company.address}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    {company.website}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 md:items-end">
                <Button variant="hero" size="lg" onClick={() => setShowReviewForm(true)}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Rəy yaz
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Reviews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Review Form */}
              {showReviewForm && (
                <ReviewForm 
                  companyName={company.name} 
                  onClose={() => setShowReviewForm(false)} 
                />
              )}

              {/* Reviews list */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Son Rəylər
                </h2>
                <div className="space-y-4">
                  {company.reviews.length > 0 ? (
                    company.reviews.map((review) => (
                      <ReviewCard key={review.id} {...review} />
                    ))
                  ) : (
                    <div className="bg-card rounded-xl p-8 text-center border border-border/50">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Bu şirkət haqqında hələ rəy yoxdur. İlk rəyi siz yazın!
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowReviewForm(true)}>
                        Rəy yaz
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Rating breakdown */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-4">Reytinq Dağılımı</h3>
                <div className="space-y-4">
                  {company.ratings.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-trust-dark rounded-full transition-all"
                          style={{ width: `${(item.value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company stats */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-4">Şirkət Məlumatları</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trust-light rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Təsis ili</p>
                      <p className="font-medium text-foreground">{company.established}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trust-light rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">İşçi sayı</p>
                      <p className="font-medium text-foreground">{company.employees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trust-light rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bu aykı rəylər</p>
                      <p className="font-medium text-foreground">+127</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyPage;
