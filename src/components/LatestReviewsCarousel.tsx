import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MessageSquare, ArrowRight, Loader2, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  company_id: string;
  company_name?: string;
  company_logo?: string;
  author_name?: string;
}

const LatestReviewsCarousel = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestReviews();
  }, []);

  const fetchLatestReviews = async () => {
    try {
      const { data: reviewsData, error } = await supabase
        .from("reviews")
        .select("id, title, content, rating, created_at, company_id, user_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Get company info
      const companyIds = [...new Set(reviewsData.map((r) => r.company_id))];
      const { data: companiesData } = await supabase
        .from("companies")
        .select("id, name, logo_url")
        .in("id", companyIds);

      // Get author info
      const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const enrichedReviews = reviewsData.map((review) => ({
        ...review,
        company_name:
          companiesData?.find((c) => c.id === review.company_id)?.name ||
          "Naməlum",
        company_logo:
          companiesData?.find((c) => c.id === review.company_id)?.logo_url ||
          null,
        author_name:
          profilesData?.find((p) => p.user_id === review.user_id)?.full_name ||
          "Anonim",
      }));

      setReviews(enrichedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <Badge variant="secondary" className="mb-3">
              <MessageSquare className="w-3 h-3 mr-1" />
              Son Rəylər
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              İstifadəçilərin Fikirləri
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Platformadakı ən son müştəri rəyləri
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="self-start md:self-auto">
              Bütün şirkətlərə bax
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem
                key={review.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full bg-card border border-border/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Link
                        to={`/company/${review.company_id}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex items-center justify-center">
                          {review.company_logo ? (
                            <img
                              src={review.company_logo}
                              alt={review.company_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-primary">
                              {review.company_name?.charAt(0)}
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/company/${review.company_id}`}>
                          <h4 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                            {review.company_name}
                          </h4>
                        </Link>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative">
                      <Quote className="w-6 h-6 text-primary/20 absolute -top-1 -left-1" />
                      <h5 className="font-medium text-foreground mb-2 line-clamp-1 pl-4">
                        {review.title}
                      </h5>
                      <p className="text-muted-foreground text-sm line-clamp-3 pl-4">
                        {review.content}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-sm text-muted-foreground">
                        {review.author_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString(
                          "az-AZ",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default LatestReviewsCarousel;
