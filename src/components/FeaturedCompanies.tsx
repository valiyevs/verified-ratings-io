import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyCard from "./CompanyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, Crown, Zap, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  description: string | null;
  subscription_plan: string | null;
  is_sponsored: boolean | null;
  response_rate: number | null;
  verified_reviews_count: number | null;
}

const FeaturedCompanies = () => {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, category, logo_url, average_rating, review_count, description, subscription_plan, is_sponsored, response_rate, verified_reviews_count")
        .eq("status", "approved")
        .order("is_sponsored", { ascending: false })
        .order("average_rating", { ascending: false, nullsFirst: false })
        .limit(6);

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching featured companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = (plan: string | null) => {
    if (plan === 'enterprise') {
      return (
        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg z-10">
          <Crown className="w-3 h-3 mr-1" />
          Enterprise
        </Badge>
      );
    }
    if (plan === 'pro') {
      return (
        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg z-10">
          <Zap className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <section id="companies" className="py-20 bg-gradient-to-b from-secondary/30 to-transparent">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (companies.length === 0) {
    return null;
  }

  return (
    <section id="companies" className="py-20 bg-gradient-to-b from-secondary/30 to-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Ən yaxşı şirkətlər
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t("featured.title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {t("featured.subtitle")}
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="self-start md:self-auto group">
              {t("featured.viewAll")}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="animate-fade-up relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {getPlanBadge(company.subscription_plan)}
              <CompanyCard
                id={company.id}
                name={company.name}
                category={company.category}
                logo={company.logo_url || "/placeholder.svg"}
                rating={company.average_rating || 0}
                reviewCount={company.review_count || 0}
                trend="stable"
                verified={true}
                topReview={company.description || undefined}
                isSponsored={company.is_sponsored || false}
                responseRate={company.response_rate || undefined}
                verifiedReviewsCount={company.verified_reviews_count || undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;