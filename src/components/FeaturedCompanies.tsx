import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyCard from "./CompanyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
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
        .select("id, name, category, logo_url, average_rating, review_count, description")
        .eq("status", "approved")
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

  if (loading) {
    return (
      <section id="companies" className="py-20 bg-secondary/30">
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
    <section id="companies" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t("featured.title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {t("featured.subtitle")}
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="self-start md:self-auto">
              {t("featured.viewAll")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;
