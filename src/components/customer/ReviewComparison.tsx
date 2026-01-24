import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Star, TrendingUp, TrendingDown, Minus, Scale, Building2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  category: string;
  average_rating: number | null;
  review_count: number | null;
  response_rate: number | null;
  verified_reviews_count: number | null;
}

interface ReviewComparison {
  company_id: string;
  avg_service: number;
  avg_price: number;
  avg_speed: number;
  avg_quality: number;
}

export const ReviewComparison = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company1, setCompany1] = useState<string>('');
  const [company2, setCompany2] = useState<string>('');
  const [comparison, setComparison] = useState<{ c1: ReviewComparison | null; c2: ReviewComparison | null } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, category, average_rating, review_count, response_rate, verified_reviews_count')
      .eq('status', 'approved')
      .order('name');

    if (data) setCompanies(data);
  };

  const fetchComparison = async () => {
    if (!company1 || !company2) return;
    setLoading(true);

    const fetchCriteria = async (companyId: string): Promise<ReviewComparison | null> => {
      const { data } = await supabase
        .from('reviews')
        .select('service_rating, price_rating, speed_rating, quality_rating')
        .eq('company_id', companyId)
        .eq('status', 'approved')
        .not('service_rating', 'is', null);

      if (!data || data.length === 0) return null;

      return {
        company_id: companyId,
        avg_service: data.reduce((sum, r) => sum + (r.service_rating || 0), 0) / data.length,
        avg_price: data.reduce((sum, r) => sum + (r.price_rating || 0), 0) / data.length,
        avg_speed: data.reduce((sum, r) => sum + (r.speed_rating || 0), 0) / data.length,
        avg_quality: data.reduce((sum, r) => sum + (r.quality_rating || 0), 0) / data.length,
      };
    };

    const [c1, c2] = await Promise.all([
      fetchCriteria(company1),
      fetchCriteria(company2)
    ]);

    setComparison({ c1, c2 });
    setLoading(false);
  };

  const getCompanyById = (id: string) => companies.find(c => c.id === id);

  const renderComparison = (label: string, val1: number | null, val2: number | null) => {
    const diff = (val1 || 0) - (val2 || 0);
    return (
      <div className="flex items-center gap-4 py-3 border-b last:border-0">
        <span className="w-24 text-sm font-medium">{label}</span>
        <div className="flex-1 flex items-center gap-2">
          <span className="w-12 text-right font-semibold">{val1?.toFixed(1) || 'N/A'}</span>
          <Progress value={(val1 || 0) * 20} className="flex-1" />
        </div>
        <div className="w-16 flex justify-center">
          {diff > 0 ? (
            <Badge variant="default" className="gap-1">
              <TrendingUp className="h-3 w-3" />+{diff.toFixed(1)}
            </Badge>
          ) : diff < 0 ? (
            <Badge variant="destructive" className="gap-1">
              <TrendingDown className="h-3 w-3" />{diff.toFixed(1)}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Minus className="h-3 w-3" />0
            </Badge>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Progress value={(val2 || 0) * 20} className="flex-1" />
          <span className="w-12 font-semibold">{val2?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>
    );
  };

  const c1Data = getCompanyById(company1);
  const c2Data = getCompanyById(company2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Şirkət Müqayisəsi
        </CardTitle>
        <CardDescription>İki şirkəti yan-yana müqayisə edin</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Company Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select value={company1} onValueChange={setCompany1}>
            <SelectTrigger>
              <SelectValue placeholder="Birinci şirkət seçin" />
            </SelectTrigger>
            <SelectContent>
              {companies
                .filter(c => c.id !== company2)
                .map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-lg px-4 py-2">VS</Badge>
          </div>

          <Select value={company2} onValueChange={setCompany2}>
            <SelectTrigger>
              <SelectValue placeholder="İkinci şirkət seçin" />
            </SelectTrigger>
            <SelectContent>
              {companies
                .filter(c => c.id !== company1)
                .map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={fetchComparison} 
          disabled={!company1 || !company2 || loading}
          className="w-full mb-6"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Müqayisə Et
        </Button>

        {/* Comparison Results */}
        {comparison && c1Data && c2Data && (
          <div className="space-y-6">
            {/* Company Headers */}
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/company/${company1}`)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{c1Data.name}</h3>
                      <p className="text-sm text-muted-foreground">{c1Data.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {c1Data.average_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {c1Data.review_count || 0} rəy
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/company/${company2}`)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{c2Data.name}</h3>
                      <p className="text-sm text-muted-foreground">{c2Data.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {c2Data.average_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {c2Data.review_count || 0} rəy
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Criteria Comparison */}
            {comparison.c1 && comparison.c2 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meyar Müqayisəsi</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderComparison('Xidmət', comparison.c1.avg_service, comparison.c2.avg_service)}
                  {renderComparison('Qiymət', comparison.c1.avg_price, comparison.c2.avg_price)}
                  {renderComparison('Sürət', comparison.c1.avg_speed, comparison.c2.avg_speed)}
                  {renderComparison('Keyfiyyət', comparison.c1.avg_quality, comparison.c2.avg_quality)}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ətraflı müqayisə üçün kifayət qədər rəy yoxdur
                </CardContent>
              </Card>
            )}

            {/* General Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ümumi Statistika</CardTitle>
              </CardHeader>
              <CardContent>
                {renderComparison('Reytinq', c1Data.average_rating, c2Data.average_rating)}
                {renderComparison('Rəy sayı', c1Data.review_count, c2Data.review_count)}
                {renderComparison('Cavab %', c1Data.response_rate, c2Data.response_rate)}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
