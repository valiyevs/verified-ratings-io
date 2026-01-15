import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, Minus, Trophy, Target, Users } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  average_rating: number | null;
  review_count: number | null;
  response_rate: number | null;
}

interface CompetitorAnalysisProps {
  companyId: string;
  category: string;
  currentRating: number | null;
  currentReviewCount: number | null;
}

export const CompetitorAnalysis = ({ 
  companyId, 
  category, 
  currentRating, 
  currentReviewCount 
}: CompetitorAnalysisProps) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    fetchCompetitors();
  }, [companyId, category]);

  const fetchCompetitors = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, average_rating, review_count, response_rate')
      .eq('category', category)
      .eq('status', 'approved')
      .neq('id', companyId)
      .order('average_rating', { ascending: false, nullsFirst: false })
      .limit(5);

    if (!error && data) {
      setCompetitors(data);
      
      // Calculate rank
      const { data: allInCategory } = await supabase
        .from('companies')
        .select('id, average_rating')
        .eq('category', category)
        .eq('status', 'approved')
        .order('average_rating', { ascending: false, nullsFirst: false });
      
      if (allInCategory) {
        const position = allInCategory.findIndex(c => c.id === companyId) + 1;
        setRank(position > 0 ? position : null);
      }
    }
    
    setLoading(false);
  };

  const getRatingDiff = (competitorRating: number | null) => {
    if (!currentRating || !competitorRating) return 0;
    return currentRating - competitorRating;
  };

  const getAverageCompetitorRating = () => {
    const rated = competitors.filter(c => c.average_rating);
    if (rated.length === 0) return null;
    return rated.reduce((sum, c) => sum + (c.average_rating || 0), 0) / rated.length;
  };

  const avgCompetitorRating = getAverageCompetitorRating();
  const totalCompetitors = competitors.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kateqoriya Sırası</p>
                <p className="text-2xl font-bold">
                  {rank ? `#${rank}` : 'N/A'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {totalCompetitors + 1}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-secondary">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rəqib Ortalaması</p>
                <p className="text-2xl font-bold">
                  {avgCompetitorRating ? avgCompetitorRating.toFixed(1) : 'N/A'}
                  {avgCompetitorRating && currentRating && (
                    <span className={`text-sm ml-2 ${currentRating > avgCompetitorRating ? 'text-green-500' : 'text-destructive'}`}>
                      {currentRating > avgCompetitorRating ? '+' : ''}{(currentRating - avgCompetitorRating).toFixed(1)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-secondary">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rəqib Sayı</p>
                <p className="text-2xl font-bold">{totalCompetitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Əsas Rəqiblər</CardTitle>
          <CardDescription>"{category}" kateqoriyasında ən yüksək reytinqli şirkətlər</CardDescription>
        </CardHeader>
        <CardContent>
          {competitors.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Bu kateqoriyada başqa şirkət yoxdur
            </p>
          ) : (
            <div className="space-y-4">
              {competitors.map((competitor, index) => {
                const diff = getRatingDiff(competitor.average_rating);
                return (
                  <div 
                    key={competitor.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{competitor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {competitor.review_count || 0} rəy
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Cavab Faizi</p>
                        <div className="flex items-center gap-2">
                          <Progress value={competitor.response_rate || 0} className="w-16 h-2" />
                          <span className="text-sm">{competitor.response_rate || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {competitor.average_rating?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                        <Badge 
                          variant={diff > 0 ? 'default' : diff < 0 ? 'destructive' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {diff > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : diff < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
