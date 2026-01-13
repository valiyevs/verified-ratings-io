import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Building2, Star, Scale, CheckCircle, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  average_rating: number;
  review_count: number;
  description: string | null;
  status: string;
}

const categories = [
  "Hamısı",
  "Banklar",
  "Telekommunikasiya",
  "E-ticarət",
  "Sığorta",
  "Retail",
  "Nəqliyyat",
  "Kommunal",
  "Səhiyyə",
  "Təhsil",
  "Restoran",
  "Otel",
  "Digər"
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const initialCategory = searchParams.get("category") || "Hamısı";
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [showFilters, setShowFilters] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    if (category) setSelectedCategory(category);
    if (query) setSearchQuery(query);
  }, [searchParams]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, logo_url, category, average_rating, review_count, description, status")
        .eq("status", "approved")
        .order("average_rating", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const ratingFilters = [
    { label: t("search.all"), value: 0 },
    { label: t("search.4stars"), value: 4 },
    { label: t("search.3stars"), value: 3 },
    { label: t("search.2stars"), value: 2 },
  ];

  const sortOptions = [
    { label: t("search.sortRatingDesc"), value: "rating-desc" },
    { label: t("search.sortRatingAsc"), value: "rating-asc" },
    { label: t("search.sortReviews"), value: "reviews-desc" },
    { label: t("search.sortName"), value: "name-asc" },
  ];

  const filteredCompanies = useMemo(() => {
    let result = companies.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Hamısı" || company.category === selectedCategory;
      const matchesRating = (company.average_rating || 0) >= minRating;
      return matchesSearch && matchesCategory && matchesRating;
    });

    // Sort
    switch (sortBy) {
      case "rating-desc":
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case "rating-asc":
        result.sort((a, b) => (a.average_rating || 0) - (b.average_rating || 0));
        break;
      case "reviews-desc":
        result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [companies, searchQuery, selectedCategory, minRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Hamısı");
    setMinRating(0);
    setSortBy("rating-desc");
  };

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(c => c !== id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, id]);
    }
  };

  const goToCompare = () => {
    navigate(`/compare?companies=${compareList.join(",")}`);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "Hamısı" || minRating > 0;

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

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {t("search.title")}
              </h1>
              {user && (
                <Button variant="hero" onClick={() => navigate("/add-company")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Şirkət əlavə et
                </Button>
              )}
            </div>
            <p className="text-muted-foreground mb-8">
              {companies.length} {t("search.subtitle")}
            </p>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("search.placeholder")}
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
                {t("search.filters")}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    Aktiv
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  {t("search.clear")}
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="max-w-5xl mx-auto mb-8 p-6 bg-card rounded-2xl border border-border animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {t("search.category")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                      >
                        {category === "Hamısı" ? t("search.all") : category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {t("search.minRating")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ratingFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setMinRating(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
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

                {/* Sort */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    {t("search.sort")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          sortBy === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compare Floating Bar */}
          {compareList.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
              <Card className="shadow-lg border-primary/20">
                <CardContent className="py-3 px-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    <span className="font-medium">{compareList.length} {t("search.companiesSelected")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {compareList.map(id => {
                      const company = companies.find(c => c.id === id);
                      return company ? (
                        <div key={id} className="w-8 h-8 rounded-full bg-secondary overflow-hidden border-2 border-background">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {company.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setCompareList([])}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button variant="default" size="sm" onClick={goToCompare} disabled={compareList.length < 2}>
                    {t("search.compareNow")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="max-w-5xl mx-auto">
            <p className="text-muted-foreground mb-4">
              {filteredCompanies.length} {t("search.results")}
            </p>

            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("search.noResults")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("search.noResultsDesc")}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={clearFilters}>
                    {t("search.clearFilters")}
                  </Button>
                  {user && (
                    <Button variant="hero" onClick={() => navigate("/add-company")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Şirkət əlavə et
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Link to={`/company/${company.id}`} className="flex-shrink-0">
                        <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                      </Link>

                      <Link to={`/company/${company.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {company.name}
                          </h3>
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {company.description || "Təsvir yoxdur"}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">{company.category}</Badge>
                          <span className="text-muted-foreground">
                            {(company.review_count || 0).toLocaleString()} {t("featured.reviews")}
                          </span>
                        </div>
                      </Link>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating rating={company.average_rating || 0} size="sm" showValue={false} />
                            <span className="font-bold text-foreground">
                              {(company.average_rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant={compareList.includes(company.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCompare(company.id)}
                          className="gap-1"
                        >
                          <Scale className="w-4 h-4" />
                          {compareList.includes(company.id) ? "Seçildi" : t("search.compare")}
                        </Button>
                      </div>
                    </div>
                  </div>
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
