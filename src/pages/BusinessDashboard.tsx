import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  MessageSquare, 
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Company {
  id: string;
  name: string;
  category: string;
  average_rating: number | null;
  review_count: number | null;
  response_rate: number | null;
  avg_response_time_hours: number | null;
  verified_reviews_count: number | null;
  subscription_plan: string | null;
}

interface Review {
  id: string;
  rating: number;
  service_rating: number | null;
  price_rating: number | null;
  speed_rating: number | null;
  quality_rating: number | null;
  created_at: string;
  company_reply: string | null;
}

interface AIAnalysis {
  positive_keywords: string[];
  negative_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  common_themes: string[];
  sentiment_score: number;
  recommendation: string;
}

const BusinessDashboard = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzingKeywords, setAnalyzingKeywords] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && companyId) {
      fetchCompanyData();
    }
  }, [user, companyId]);

  const fetchCompanyData = async () => {
    if (!companyId) return;
    setLoading(true);

    // Fetch company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (companyError || !companyData) {
      toast({ title: 'Şirkət tapılmadı', variant: 'destructive' });
      navigate('/');
      return;
    }

    // Check if user is owner
    if (companyData.owner_id !== user?.id) {
      toast({ title: 'Bu dashboard-a giriş hüququnuz yoxdur', variant: 'destructive' });
      navigate('/');
      return;
    }

    setIsOwner(true);
    setCompany(companyData);

    // Fetch reviews with criteria
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('id, rating, service_rating, price_rating, speed_rating, quality_rating, created_at, company_reply')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    setReviews(reviewsData || []);
    setLoading(false);
  };

  const analyzeKeywords = async () => {
    if (!companyId) return;
    setAnalyzingKeywords(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-company-keywords', {
        body: { companyId }
      });

      if (error) throw error;
      setAiAnalysis(data);
    } catch (err) {
      console.error('AI analysis error:', err);
      toast({ title: 'Analiz xətası', description: 'AI analizi icra edilə bilmədi.', variant: 'destructive' });
    } finally {
      setAnalyzingKeywords(false);
    }
  };

  // Calculate trend data for charts
  const getTrendData = () => {
    const monthlyData: { [key: string]: { ratings: number[], count: number } } = {};
    
    reviews.forEach(review => {
      const month = new Date(review.created_at).toLocaleDateString('az-AZ', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { ratings: [], count: 0 };
      }
      monthlyData[month].ratings.push(review.rating);
      monthlyData[month].count++;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      rating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
      count: data.count
    }));
  };

  // Calculate criteria averages
  const getCriteriaAverages = () => {
    const withCriteria = reviews.filter(r => r.service_rating);
    if (withCriteria.length === 0) return null;

    return {
      service: withCriteria.reduce((sum, r) => sum + (r.service_rating || 0), 0) / withCriteria.length,
      price: withCriteria.reduce((sum, r) => sum + (r.price_rating || 0), 0) / withCriteria.length,
      speed: withCriteria.reduce((sum, r) => sum + (r.speed_rating || 0), 0) / withCriteria.length,
      quality: withCriteria.reduce((sum, r) => sum + (r.quality_rating || 0), 0) / withCriteria.length,
    };
  };

  const criteriaAverages = getCriteriaAverages();
  const trendData = getTrendData();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!company || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <Link 
          to={`/company/${companyId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Şirkət səhifəsinə qayıt
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              {company.name} - Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Şirkətinizin analitikası və performansı</p>
          </div>
          <Badge variant={company.subscription_plan === 'free' ? 'secondary' : 'default'}>
            {company.subscription_plan?.toUpperCase() || 'FREE'} Plan
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Reytinq</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(company.average_rating || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{company.review_count || 0} rəy əsasında</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cavab Faizi</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(company.response_rate || 0).toFixed(0)}%</div>
              <Progress value={company.response_rate || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orta Cavab Müddəti</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company.avg_response_time_hours 
                  ? `${Math.round(company.avg_response_time_hours)} saat` 
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Rəylərə cavab müddəti</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Təsdiqlənmiş Rəylər</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.verified_reviews_count || 0}</div>
              <p className="text-xs text-muted-foreground">FIN təsdiqli istifadəçilərdən</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Ümumi Baxış</TabsTrigger>
            <TabsTrigger value="criteria">Meyarlar</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI Analiz</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Rating Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Reytinq Trendi</CardTitle>
                  <CardDescription>Aylıq orta reytinq dəyişimi</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rating" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Trend üçün kifayət qədər məlumat yoxdur
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Count Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Rəy Sayı</CardTitle>
                  <CardDescription>Aylıq rəy dinamikası</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Trend üçün kifayət qədər məlumat yoxdur
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meyarlar üzrə Analiz</CardTitle>
                <CardDescription>Güclü və zəif tərəflərinizi görün</CardDescription>
              </CardHeader>
              <CardContent>
                {criteriaAverages ? (
                  <div className="space-y-6">
                    {[
                      { label: 'Xidmət Keyfiyyəti', value: criteriaAverages.service, icon: Users },
                      { label: 'Qiymət Uyğunluğu', value: criteriaAverages.price, icon: Star },
                      { label: 'Sürət', value: criteriaAverages.speed, icon: Clock },
                      { label: 'Keyfiyyət', value: criteriaAverages.quality, icon: CheckCircle2 },
                    ].map((item) => {
                      const isStrong = item.value >= 4;
                      const isWeak = item.value < 3;
                      return (
                        <div key={item.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <item.icon className={`h-5 w-5 ${isStrong ? 'text-green-500' : isWeak ? 'text-red-500' : 'text-yellow-500'}`} />
                              <span className="font-medium">{item.label}</span>
                              {isStrong && <Badge variant="default" className="ml-2">Güclü</Badge>}
                              {isWeak && <Badge variant="destructive" className="ml-2">Təkmilləşdirmə lazım</Badge>}
                            </div>
                            <span className="font-bold">{item.value.toFixed(1)}/5</span>
                          </div>
                          <Progress value={(item.value / 5) * 100} className={isStrong ? '[&>div]:bg-green-500' : isWeak ? '[&>div]:bg-red-500' : ''} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <p>Meyarlar üzrə rəy yoxdur</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Açar Söz Analizi
                </CardTitle>
                <CardDescription>
                  Süni intellekt rəylərinizi analiz edərək güclü və zəif tərəflərinizi müəyyən edir
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!aiAnalysis ? (
                  <div className="py-8 text-center">
                    <Button onClick={analyzeKeywords} disabled={analyzingKeywords}>
                      {analyzingKeywords ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analiz edilir...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Analizi Başlat
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      Analiz son 50 rəy əsasında aparılacaq
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Sentiment Score */}
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Ümumi Sentiment</span>
                        <span className="text-2xl font-bold text-primary">{aiAnalysis.sentiment_score}/100</span>
                      </div>
                      <Progress value={aiAnalysis.sentiment_score} />
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400 mb-3">
                          <ThumbsUp className="h-5 w-5" />
                          Güclü Tərəflər
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.strengths.map((strength, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
                          <ThumbsDown className="h-5 w-5" />
                          Təkmilləşdirmə Sahələri
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.weaknesses.map((weakness, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-3">Müsbət Açar Sözlər</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.positive_keywords.map((keyword, i) => (
                            <Badge key={i} variant="default">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Mənfi Açar Sözlər</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.negative_keywords.map((keyword, i) => (
                            <Badge key={i} variant="destructive">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Tövsiyəsi
                      </h4>
                      <p className="text-sm">{aiAnalysis.recommendation}</p>
                    </div>

                    <Button variant="outline" onClick={analyzeKeywords} disabled={analyzingKeywords}>
                      {analyzingKeywords ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Yenidən Analiz Et
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessDashboard;
