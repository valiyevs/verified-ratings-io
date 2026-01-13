import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { Link } from "react-router-dom";
import {
  Building2,
  MessageSquare,
  Users,
  TrendingUp,
  Star,
  Loader2,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { az } from "date-fns/locale";

interface Stats {
  totalCompanies: number;
  approvedCompanies: number;
  totalReviews: number;
  approvedReviews: number;
  totalUsers: number;
  avgRating: number;
}

interface RecentReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  company_id: string;
  company_name?: string;
  author_name?: string;
}

interface PopularCompany {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  average_rating: number;
  review_count: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    approvedCompanies: 0,
    totalReviews: 0,
    approvedReviews: 0,
    totalUsers: 0,
    avgRating: 0,
  });
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [popularCompanies, setPopularCompanies] = useState<PopularCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch companies count
    const { count: totalCompanies } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true });

    const { count: approvedCompanies } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Fetch reviews count
    const { count: totalReviews } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });

    const { count: approvedReviews } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Fetch users count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Fetch average rating from approved companies
    const { data: ratingData } = await supabase
      .from("companies")
      .select("average_rating")
      .eq("status", "approved")
      .not("average_rating", "is", null);

    const avgRating =
      ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, c) => sum + (c.average_rating || 0), 0) / ratingData.length
        : 0;

    setStats({
      totalCompanies: totalCompanies || 0,
      approvedCompanies: approvedCompanies || 0,
      totalReviews: totalReviews || 0,
      approvedReviews: approvedReviews || 0,
      totalUsers: totalUsers || 0,
      avgRating,
    });

    // Fetch recent approved reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("id, title, content, rating, created_at, company_id, user_id")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5);

    if (reviewsData && reviewsData.length > 0) {
      // Get company names
      const companyIds = [...new Set(reviewsData.map((r) => r.company_id))];
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      // Get user names
      const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const enrichedReviews = reviewsData.map((r) => ({
        ...r,
        company_name: companies?.find((c) => c.id === r.company_id)?.name || "Bilinməyən",
        author_name: profiles?.find((p) => p.user_id === r.user_id)?.full_name || "Anonim",
      }));

      setRecentReviews(enrichedReviews);
    }

    // Fetch popular companies
    const { data: popularData } = await supabase
      .from("companies")
      .select("id, name, logo_url, category, average_rating, review_count")
      .eq("status", "approved")
      .order("review_count", { ascending: false })
      .limit(6);

    if (popularData) {
      setPopularCompanies(popularData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Platform Statistikası
            </h1>
            <p className="text-muted-foreground">
              RəyAz platformasının ümumi göstəriciləri
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stats.approvedCompanies}</p>
                <p className="text-xs text-muted-foreground">Təsdiqlənmiş Şirkət</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalCompanies - stats.approvedCompanies}
                </p>
                <p className="text-xs text-muted-foreground">Gözləyən Şirkət</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-foreground">{stats.approvedReviews}</p>
                <p className="text-xs text-muted-foreground">Təsdiqlənmiş Rəy</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalReviews - stats.approvedReviews}
                </p>
                <p className="text-xs text-muted-foreground">Gözləyən Rəy</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">İstifadəçi</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Orta Reytinq</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Reviews */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Son Rəylər
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentReviews.length > 0 ? (
                  recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/company/${review.company_id}`}
                            className="font-medium text-foreground hover:text-primary truncate"
                          >
                            {review.company_name}
                          </Link>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {review.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {review.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{review.author_name}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(review.created_at), "d MMM yyyy", { locale: az })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Hələ rəy yoxdur
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Popular Companies */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Populyar Şirkətlər
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularCompanies.length > 0 ? (
                  popularCompanies.map((company, index) => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                            {company.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary">
                          {company.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {company.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {company.review_count || 0} rəy
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-foreground">
                          {(company.average_rating || 0).toFixed(1)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Hələ şirkət yoxdur
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
