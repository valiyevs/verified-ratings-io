import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Stats {
  totalCompanies: number;
  pendingCompanies: number;
  approvedCompanies: number;
  totalReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  totalUsers: number;
  avgRating: number;
}

interface TrendData {
  date: string;
  companies: number;
  reviews: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const AdminDashboardStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch companies stats
    const { data: companies } = await supabase
      .from('companies')
      .select('status, average_rating, created_at');

    // Fetch reviews stats
    const { data: reviews } = await supabase
      .from('reviews')
      .select('status, is_flagged, created_at');

    // Fetch users count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (companies && reviews) {
      setStats({
        totalCompanies: companies.length,
        pendingCompanies: companies.filter(c => c.status === 'pending').length,
        approvedCompanies: companies.filter(c => c.status === 'approved').length,
        totalReviews: reviews.length,
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        flaggedReviews: reviews.filter(r => r.is_flagged).length,
        totalUsers: usersCount || 0,
        avgRating: companies.reduce((sum, c) => sum + (c.average_rating || 0), 0) / (companies.length || 1),
      });

      // Calculate trend data (last 7 days)
      const last7Days: TrendData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        last7Days.push({
          date: date.toLocaleDateString('az-AZ', { weekday: 'short' }),
          companies: companies.filter(c => c.created_at.startsWith(dateStr)).length,
          reviews: reviews.filter(r => r.created_at.startsWith(dateStr)).length,
        });
      }
      setTrendData(last7Days);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { name: 'Təsdiqlənib', value: stats.approvedCompanies },
    { name: 'Gözləyir', value: stats.pendingCompanies },
    { name: 'Rədd edilib', value: stats.totalCompanies - stats.approvedCompanies - stats.pendingCompanies },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Şirkətlər</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-500">{stats.pendingCompanies}</span> gözləyir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rəylər</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">{stats.flaggedReviews}</span> şübhəli
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">İstifadəçilər</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Qeydiyyatlı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orta Reytinq</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Platform ortalaması</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Son 7 Gün Aktivliyi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="companies" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Şirkətlər"
                />
                <Line 
                  type="monotone" 
                  dataKey="reviews" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Rəylər"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Şirkət Statusları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingCompanies}</p>
                <p className="text-sm text-muted-foreground">Gözləyən Şirkətlər</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                <p className="text-sm text-muted-foreground">Gözləyən Rəylər</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.flaggedReviews}</p>
                <p className="text-sm text-muted-foreground">Şübhəli Rəylər</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
