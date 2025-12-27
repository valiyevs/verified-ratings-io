import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";

interface Company {
  id: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  verified: boolean;
}

const allCompanies: Company[] = [
  {
    id: "kapital-bank",
    name: "Kapital Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kapital_Bank_logo.svg/200px-Kapital_Bank_logo.svg.png",
    category: "Banklar",
    rating: 4.2,
    reviewCount: 1847,
    description: "Azərbaycanın aparıcı bankı",
    verified: true,
  },
  {
    id: "azercell",
    name: "Azercell",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Azercell_logo.svg/200px-Azercell_logo.svg.png",
    category: "Telekommunikasiya",
    rating: 3.8,
    reviewCount: 2341,
    description: "Mobil rabitə operatoru",
    verified: true,
  },
  {
    id: "wolt",
    name: "Wolt",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Wolt-Logo.svg/200px-Wolt-Logo.svg.png",
    category: "E-ticarət",
    rating: 4.5,
    reviewCount: 3421,
    description: "Yemək çatdırılma xidməti",
    verified: true,
  },
  {
    id: "pasha-sigorta",
    name: "PASHA Sığorta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/PASHA_Insurance_logo.svg/200px-PASHA_Insurance_logo.svg.png",
    category: "Sığorta",
    rating: 4.0,
    reviewCount: 892,
    description: "Sığorta xidmətləri",
    verified: true,
  },
  {
    id: "azersu",
    name: "Azərsu",
    logo: "https://upload.wikimedia.org/wikipedia/az/thumb/7/7e/Az%C9%99rsu_ASC.png/200px-Az%C9%99rsu_ASC.png",
    category: "Kommunal",
    rating: 2.8,
    reviewCount: 1523,
    description: "Su təchizatı xidməti",
    verified: true,
  },
  {
    id: "bakcell",
    name: "Bakcell",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Bakcell_logo.svg/200px-Bakcell_logo.svg.png",
    category: "Telekommunikasiya",
    rating: 3.6,
    reviewCount: 1876,
    description: "Mobil rabitə operatoru",
    verified: true,
  },
  {
    id: "expressbank",
    name: "Express Bank",
    logo: "https://expressbank.az/themes/expressbank/assets/img/logo.svg",
    category: "Banklar",
    rating: 3.9,
    reviewCount: 743,
    description: "Bank xidmətləri",
    verified: true,
  },
  {
    id: "bravo",
    name: "Bravo",
    logo: "https://bravo.az/assets/logo-6f37dfe3.svg",
    category: "Retail",
    rating: 4.1,
    reviewCount: 2156,
    description: "Supermarket şəbəkəsi",
    verified: true,
  },
  {
    id: "bolt",
    name: "Bolt",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Bolt_logo.svg/200px-Bolt_logo.svg.png",
    category: "Nəqliyyat",
    rating: 4.3,
    reviewCount: 4521,
    description: "Taksi və çatdırılma xidməti",
    verified: true,
  },
  {
    id: "nar",
    name: "Nar Mobile",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Nar_Mobile_logo.svg/200px-Nar_Mobile_logo.svg.png",
    category: "Telekommunikasiya",
    rating: 3.4,
    reviewCount: 1234,
    description: "Mobil rabitə operatoru",
    verified: true,
  },
];

const categories = [
  "Hamısı",
  "Banklar",
  "Telekommunikasiya",
  "E-ticarət",
  "Sığorta",
  "Retail",
  "Nəqliyyat",
  "Kommunal",
];

const ratingFilters = [
  { label: "Hamısı", value: 0 },
  { label: "4+ ulduz", value: 4 },
  { label: "3+ ulduz", value: 3 },
  { label: "2+ ulduz", value: 2 },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hamısı");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Hamısı" || company.category === selectedCategory;
      const matchesRating = company.rating >= minRating;
      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [searchQuery, selectedCategory, minRating]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Hamısı");
    setMinRating(0);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "Hamısı" || minRating > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Şirkət Axtarışı
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              {allCompanies.length} şirkət arasından axtarış edin
            </p>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Şirkət adı və ya açar söz axtarın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-12 text-lg rounded-xl border-2 border-border focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtrlər
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Aktiv
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Təmizlə
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="max-w-4xl mx-auto mb-8 p-6 bg-card rounded-2xl border border-border animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Kateqoriya
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Minimum Reytinq
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ratingFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setMinRating(filter.value)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          minRating === filter.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground mb-4">
              {filteredCompanies.length} nəticə tapıldı
            </p>

            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nəticə tapılmadı
                </h3>
                <p className="text-muted-foreground mb-4">
                  Axtarış kriteriyalarınıza uyğun şirkət tapılmadı
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Filtrləri təmizlə
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <Link
                    key={company.id}
                    to={`/company/${company.id}`}
                    className="block bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {company.name}
                          </h3>
                          {company.verified && (
                            <Badge variant="secondary" className="shrink-0">
                              Doğrulanmış
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {company.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">{company.category}</Badge>
                          <span className="text-muted-foreground">
                            {company.reviewCount.toLocaleString()} rəy
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={company.rating} size="sm" showValue={false} />
                          <span className="font-bold text-foreground">
                            {company.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
