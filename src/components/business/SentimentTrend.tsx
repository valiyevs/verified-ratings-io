import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Review {
  rating: number;
  created_at: string;
  service_rating?: number | null;
  price_rating?: number | null;
  speed_rating?: number | null;
  quality_rating?: number | null;
}

interface SentimentTrendProps {
  reviews: Review[];
}

export const SentimentTrend = ({ reviews }: SentimentTrendProps) => {
  const getMonthlyData = () => {
    const monthlyMap: Record<string, { ratings: number[]; positive: number; negative: number; neutral: number }> = {};

    reviews.forEach((review) => {
      const month = new Date(review.created_at).toLocaleDateString('az-AZ', { year: '2-digit', month: 'short' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { ratings: [], positive: 0, negative: 0, neutral: 0 };
      }
      monthlyMap[month].ratings.push(review.rating);
      if (review.rating >= 4) monthlyMap[month].positive++;
      else if (review.rating <= 2) monthlyMap[month].negative++;
      else monthlyMap[month].neutral++;
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      avgRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
      positive: data.positive,
      negative: data.negative,
      neutral: data.neutral,
      total: data.ratings.length,
      sentiment: ((data.positive - data.negative) / data.ratings.length) * 100,
    }));
  };

  const monthlyData = getMonthlyData();

  // Calculate overall trend
  const getTrend = () => {
    if (monthlyData.length < 2) return 'stable';
    const recent = monthlyData.slice(-3);
    const older = monthlyData.slice(-6, -3);
    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((s, d) => s + d.avgRating, 0) / recent.length;
    const olderAvg = older.reduce((s, d) => s + d.avgRating, 0) / older.length;
    
    if (recentAvg - olderAvg > 0.3) return 'up';
    if (olderAvg - recentAvg > 0.3) return 'down';
    return 'stable';
  };

  const trend = getTrend();

  if (reviews.length < 3) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Sentiment trendi üçün ən az 3 rəy lazımdır
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sentiment Trendi</CardTitle>
            <CardDescription>Müştəri məmnuniyyətinin zaman üzrə dəyişimi</CardDescription>
          </div>
          <Badge
            variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
            className="flex items-center gap-1"
          >
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'stable' && <Minus className="h-3 w-3" />}
            {trend === 'up' ? 'Yüksəlir' : trend === 'down' ? 'Azalır' : 'Sabit'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[-100, 100]} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'sentiment') return [`${value.toFixed(0)}%`, 'Sentiment'];
                return [value, name];
              }}
            />
            <defs>
              <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="hsl(var(--primary))"
              fill="url(#sentimentGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Sentiment Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="p-3 rounded-lg bg-green-500/10">
            <p className="text-lg font-bold text-green-600">
              {reviews.filter(r => r.rating >= 4).length}
            </p>
            <p className="text-xs text-muted-foreground">Müsbət</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <p className="text-lg font-bold text-yellow-600">
              {reviews.filter(r => r.rating === 3).length}
            </p>
            <p className="text-xs text-muted-foreground">Neytral</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <p className="text-lg font-bold text-red-600">
              {reviews.filter(r => r.rating <= 2).length}
            </p>
            <p className="text-xs text-muted-foreground">Mənfi</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
