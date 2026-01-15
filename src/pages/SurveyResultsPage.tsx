import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar,
  Loader2,
  PieChart,
  TrendingUp,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface Survey {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  company_id: string;
  is_active: boolean;
  questions: any[];
  reward_points: number | null;
}

interface SurveyResponse {
  id: string;
  answers: any;
  created_at: string;
  user_id: string;
}

interface QuestionStats {
  question: string;
  type: string;
  options?: string[];
  responses: { [key: string]: number };
  avgRating?: number;
  textResponses?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c43'];

const SurveyResultsPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && surveyId) {
      fetchSurveyData();
    }
  }, [user, surveyId]);

  const fetchSurveyData = async () => {
    if (!surveyId || !user) return;
    setLoading(true);

    // Fetch survey
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !surveyData) {
      toast({ title: 'Sorğu tapılmadı', variant: 'destructive' });
      navigate('/my-companies');
      return;
    }

    // Check if user owns the company
    const { data: companyData } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', surveyData.company_id)
      .single();

    if (!companyData || companyData.owner_id !== user.id) {
      toast({ title: 'Bu sorğunun nəticələrinə giriş hüququnuz yoxdur', variant: 'destructive' });
      navigate('/my-companies');
      return;
    }

    setIsOwner(true);
    const surveyWithQuestions = {
      ...surveyData,
      questions: Array.isArray(surveyData.questions) ? surveyData.questions : []
    };
    setSurvey(surveyWithQuestions as Survey);

    // Fetch responses
    const { data: responsesData } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (responsesData) {
      setResponses(responsesData);
      analyzeResponses(surveyData.questions as any[], responsesData);
    }

    setLoading(false);
  };

  const analyzeResponses = (questions: any[], responseData: SurveyResponse[]) => {
    const stats: QuestionStats[] = questions.map((q, index) => {
      const stat: QuestionStats = {
        question: q.question,
        type: q.type,
        options: q.options,
        responses: {},
        textResponses: []
      };

      responseData.forEach(response => {
        const answers = response.answers as { [key: string]: any };
        const answer = answers[`q${index}`];

        if (answer !== undefined && answer !== null) {
          if (q.type === 'text') {
            stat.textResponses?.push(answer);
          } else if (q.type === 'rating') {
            const ratingKey = String(answer);
            stat.responses[ratingKey] = (stat.responses[ratingKey] || 0) + 1;
          } else if (q.type === 'single' || q.type === 'multiple') {
            if (Array.isArray(answer)) {
              answer.forEach(a => {
                stat.responses[a] = (stat.responses[a] || 0) + 1;
              });
            } else {
              stat.responses[answer] = (stat.responses[answer] || 0) + 1;
            }
          }
        }
      });

      // Calculate average for rating questions
      if (q.type === 'rating') {
        const ratings = Object.entries(stat.responses);
        if (ratings.length > 0) {
          const total = ratings.reduce((sum, [rating, count]) => sum + (Number(rating) * count), 0);
          const count = ratings.reduce((sum, [, count]) => sum + count, 0);
          stat.avgRating = total / count;
        }
      }

      return stat;
    });

    setQuestionStats(stats);
  };

  const getChartData = (stat: QuestionStats) => {
    if (stat.type === 'rating') {
      return [1, 2, 3, 4, 5].map(rating => ({
        name: `${rating} ulduz`,
        value: stat.responses[String(rating)] || 0
      }));
    }
    return Object.entries(stat.responses).map(([option, count]) => ({
      name: option,
      value: count
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!survey || !isOwner) {
    return null;
  }

  const totalResponses = responses.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <Link 
          to="/my-companies"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Şirkətlərimə qayıt
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">{survey.title}</h1>
            </div>
            <p className="text-muted-foreground">{survey.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={survey.is_active ? 'default' : 'secondary'}>
              {survey.is_active ? 'Aktiv' : 'Dayandırılıb'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Cavablar</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalResponses}</div>
              <p className="text-xs text-muted-foreground">İştirakçı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Suallar</CardTitle>
              <MessageSquare className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{survey.questions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Sual sayı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yaradılma Tarixi</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(survey.created_at).toLocaleDateString('az-AZ')}
              </div>
              <p className="text-xs text-muted-foreground">Tarix</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mükafat</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{survey.reward_points || 0}</div>
              <p className="text-xs text-muted-foreground">Xal</p>
            </CardContent>
          </Card>
        </div>

        {/* No responses */}
        {totalResponses === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Hələ cavab yoxdur</h3>
              <p className="text-muted-foreground">
                Sorğunuza hələ heç kim cavab verməyib. İştirakçıları cəlb etmək üçün sorğu linkini paylaşın.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Question Stats */}
        {totalResponses > 0 && (
          <div className="space-y-8">
            {questionStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Sual {index + 1}</Badge>
                    <Badge variant="secondary">
                      {stat.type === 'single' && 'Tək seçim'}
                      {stat.type === 'multiple' && 'Çoxlu seçim'}
                      {stat.type === 'rating' && 'Reytinq'}
                      {stat.type === 'text' && 'Mətn'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{stat.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Rating questions */}
                  {stat.type === 'rating' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-4xl font-bold text-primary">
                          {stat.avgRating?.toFixed(1) || 0}
                        </div>
                        <div>
                          <p className="font-medium">Orta Reytinq</p>
                          <p className="text-sm text-muted-foreground">5 üzərindən</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={getChartData(stat)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Single/Multiple choice questions */}
                  {(stat.type === 'single' || stat.type === 'multiple') && (
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Bar Chart */}
                      <div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={getChartData(stat)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      <div>
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartsPieChart>
                            <Pie
                              data={getChartData(stat)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getChartData(stat).map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Percentage breakdown */}
                      <div className="lg:col-span-2 space-y-3">
                        {getChartData(stat).map((item, i) => {
                          const percentage = totalResponses > 0 
                            ? (item.value / totalResponses) * 100 
                            : 0;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="font-medium">{item.value} cavab ({percentage.toFixed(1)}%)</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Text responses */}
                  {stat.type === 'text' && stat.textResponses && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        {stat.textResponses.length} mətn cavabı
                      </p>
                      <div className="max-h-[400px] overflow-y-auto space-y-3">
                        {stat.textResponses.map((response, i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg">
                            <p className="text-sm">{response}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Response Timeline */}
        {totalResponses > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Cavab Dinamikası
              </CardTitle>
              <CardDescription>Son 30 gündə cavab sayı</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart 
                  data={(() => {
                    const last30Days: { [key: string]: number } = {};
                    for (let i = 29; i >= 0; i--) {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      const key = date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
                      last30Days[key] = 0;
                    }
                    
                    responses.forEach(r => {
                      const date = new Date(r.created_at);
                      const key = date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
                      if (last30Days.hasOwnProperty(key)) {
                        last30Days[key]++;
                      }
                    });

                    return Object.entries(last30Days).map(([date, count]) => ({ date, count }));
                  })()}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SurveyResultsPage;