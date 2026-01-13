import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarRating from "@/components/StarRating";
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
  Shield,
  Sparkles,
  Trophy,
  Target,
  Lightbulb,
  BarChart3,
  ArrowRight
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

interface MyCompany {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  subscription_plan: string | null;
  ranking?: number;
  totalInCategory?: number;
}

interface AIRecommendations {
  overall_assessment: string;
  ranking_insight: string;
  priority_areas: string[];
  recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    timeframe: string;
  }>;
  quick_wins: string[];
  competitor_advantage: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isModerator, loading: roleLoading } = useUserRole();
  
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
  const [myCompanies, setMyCompanies] = useState<MyCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<MyCompany | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      fetchDashboardData();
    }
  }, [user, authLoading, roleLoading]);

  const fetchDashboardData = async () => {
    setLoading(true);

    // If admin, fetch platform stats
    if (isAdmin || isModerator) {
      const { count: totalCompanies } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });

      const { count: approvedCompanies } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      const { count: totalReviews } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });

      const { count: approvedReviews } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

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

      // Fetch recent reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("id, title, content, rating, created_at, company_id, user_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      if (reviewsData && reviewsData.length > 0) {
        const companyIds = [...new Set(reviewsData.map((r) => r.company_id))];
        const { data: companies } = await supabase
          .from("companies")
          .select("id, name")
          .in("id", companyIds);

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
    }

    // Fetch user's companies
    const { data: myCompaniesData } = await supabase
      .from("companies")
      .select("id, name, category, logo_url, average_rating, review_count, subscription_plan")
      .eq("owner_id", user?.id)
      .eq("status", "approved");

    if (myCompaniesData && myCompaniesData.length > 0) {
      // Calculate rankings for each company
      const enrichedCompanies = await Promise.all(myCompaniesData.map(async (company) => {
        const { data: categoryCompanies } = await supabase
          .from("companies")
          .select("id, average_rating")
          .eq("category", company.category)
          .eq("status", "approved")
          .order("average_rating", { ascending: false });

        const ranking = categoryCompanies?.findIndex(c => c.id === company.id) ?? -1;
        return {
          ...company,
          ranking: ranking + 1,
          totalInCategory: categoryCompanies?.length || 0
        };
      }));

      setMyCompanies(enrichedCompanies);
      if (enrichedCompanies.length > 0) {
        setSelectedCompany(enrichedCompanies[0]);
      }
    }

    setLoading(false);
  };

  const fetchAIRecommendations = async (company: MyCompany) => {
    setLoadingRecommendations(true);
    setAiRecommendations(null);

    try {
      // Fetch reviews for this company
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, content, service_rating, price_rating, speed_rating, quality_rating")
        .eq("company_id", company.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data, error } = await supabase.functions.invoke("generate-ai-recommendations", {
        body: {
          companyId: company.id,
          companyName: company.name,
          category: company.category,
          averageRating: company.average_rating || 0,
          reviewCount: company.review_count || 0,
          reviews: reviews || [],
          competitorRanking: company.ranking || 0,
          totalInCategory: company.totalInCategory || 0
        }
      });

      if (error) throw error;
      setAiRecommendations(data);
    } catch (err) {
      console.error("AI recommendations error:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (authLoading || roleLoading || loading) {
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

  // Check access - must be admin or company owner
  const hasAccess = isAdmin || isModerator || myCompanies.length > 0;
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto text-center py-12">
              <CardContent>
                <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Giriş məhdudiyyəti</h2>
                <p className="text-muted-foreground mb-6">
                  Bu səhifəyə yalnız admin və ya şirkət sahibləri daxil ola bilər.
                </p>
                <div className="flex flex-col gap-2">
                  <Link to="/add-company">
                    <Button className="w-full">
                      <Building2 className="h-4 w-4 mr-2" />
                      Şirkət əlavə et
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" className="w-full">
                      Ana səhifəyə qayıt
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                {isAdmin ? <Shield className="h-8 w-8 text-primary" /> : <BarChart3 className="h-8 w-8 text-primary" />}
                {isAdmin ? "Admin Dashboard" : "Şirkət Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin ? "Platformun ümumi göstəriciləri" : "Şirkətinizin performansı və AI tövsiyələri"}
              </p>
            </div>
            {!isAdmin && myCompanies.length > 0 && (
              <Link to="/my-companies">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Bütün şirkətlərim
                </Button>
              </Link>
            )}
          </div>

          {/* Admin View */}
          {(isAdmin || isModerator) && (
            <>
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

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
                        <div key={review.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link to={`/company/${review.company_id}`} className="font-medium text-foreground hover:text-primary truncate">
                                {review.company_name}
                              </Link>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">{review.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{review.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{review.author_name}</span>
                              <span>•</span>
                              <span>{format(new Date(review.created_at), "d MMM yyyy", { locale: az })}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Hələ rəy yoxdur</p>
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
                        <Link key={company.id} to={`/company/${company.id}`} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{index + 1}</span>
                          <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                            {company.logo_url ? (
                              <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold">{company.name.charAt(0)}</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate group-hover:text-primary">{company.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{company.category}</Badge>
                              <span className="text-xs text-muted-foreground">{company.review_count || 0} rəy</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-foreground">{(company.average_rating || 0).toFixed(1)}</span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Hələ şirkət yoxdur</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Company Owner View */}
          {myCompanies.length > 0 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Şirkətlərim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {myCompanies.map((company) => (
                      <Button
                        key={company.id}
                        variant={selectedCompany?.id === company.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedCompany(company);
                          setAiRecommendations(null);
                        }}
                        className="flex items-center gap-2"
                      >
                        {company.name}
                        <Badge variant="secondary" className="ml-1">
                          {(company.average_rating || 0).toFixed(1)}
                        </Badge>
                      </Button>
                    ))}
                  </div>

                  {selectedCompany && (
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <Card className="bg-secondary/30">
                        <CardContent className="p-4 text-center">
                          <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                          <p className="text-2xl font-bold">{(selectedCompany.average_rating || 0).toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Reytinq</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/30">
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <p className="text-2xl font-bold">{selectedCompany.review_count || 0}</p>
                          <p className="text-xs text-muted-foreground">Rəy</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/30">
                        <CardContent className="p-4 text-center">
                          <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                          <p className="text-2xl font-bold">#{selectedCompany.ranking}</p>
                          <p className="text-xs text-muted-foreground">{selectedCompany.category} kateqoriyasında</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/30">
                        <CardContent className="p-4 text-center">
                          <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold">{selectedCompany.totalInCategory}</p>
                          <p className="text-xs text-muted-foreground">Rəqib</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              {selectedCompany && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          AI Tövsiyələri
                        </CardTitle>
                        <CardDescription>
                          Reytinqinizi yüksəltmək üçün şəxsi tövsiyələr
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => fetchAIRecommendations(selectedCompany)} disabled={loadingRecommendations}>
                          {loadingRecommendations ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analiz edilir...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI Analiz
                            </>
                          )}
                        </Button>
                        <Link to={`/business-dashboard/${selectedCompany.id}`}>
                          <Button variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Ətraflı Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!aiRecommendations && !loadingRecommendations && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>AI tövsiyələri almaq üçün "AI Analiz" düyməsinə klikləyin</p>
                      </div>
                    )}

                    {loadingRecommendations && (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Rəylər analiz edilir...</p>
                      </div>
                    )}

                    {aiRecommendations && (
                      <div className="space-y-6">
                        {/* Overall Assessment */}
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Ümumi Qiymətləndirmə</h4>
                          <p className="text-sm">{aiRecommendations.overall_assessment}</p>
                        </div>

                        {/* Ranking Insight */}
                        {aiRecommendations.ranking_insight && (
                          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                            <Trophy className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-amber-700 dark:text-amber-400">Rəqabət Mövqeyi</h4>
                              <p className="text-sm">{aiRecommendations.ranking_insight}</p>
                            </div>
                          </div>
                        )}

                        {/* Priority Areas */}
                        {aiRecommendations.priority_areas.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-red-500" />
                              Prioritet Sahələr
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {aiRecommendations.priority_areas.map((area, i) => (
                                <Badge key={i} variant="destructive">{area}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Wins */}
                        {aiRecommendations.quick_wins.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Tez Nəticə Verən Addımlar
                            </h4>
                            <ul className="space-y-2">
                              {aiRecommendations.quick_wins.map((win, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {win}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Detailed Recommendations */}
                        {aiRecommendations.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">Ətraflı Tövsiyələr</h4>
                            <div className="space-y-3">
                              {aiRecommendations.recommendations.map((rec, i) => (
                                <div key={i} className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{rec.title}</h5>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                                        {rec.impact === 'high' ? 'Yüksək təsir' : rec.impact === 'medium' ? 'Orta təsir' : 'Aşağı təsir'}
                                      </Badge>
                                      <Badge variant="outline">{rec.timeframe}</Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Competitor Advantage */}
                        {aiRecommendations.competitor_advantage && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Rəqabət Üstünlüyü
                            </h4>
                            <p className="text-sm">{aiRecommendations.competitor_advantage}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
