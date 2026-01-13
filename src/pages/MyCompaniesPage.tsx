import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Star, 
  MessageSquare, 
  BarChart3,
  Plus,
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  category: string;
  status: string;
  logo_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  subscription_plan: string | null;
}

const MyCompaniesPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyCompanies();
    }
  }, [user]);

  const fetchMyCompanies = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, category, status, logo_url, average_rating, review_count, subscription_plan')
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching companies:', error);
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      setCompanies(data || []);
    }
    
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Təsdiqlənib</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Gözləyir</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rədd edilib</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Şirkətlərim
            </h1>
            <p className="text-muted-foreground mt-1">Sahib olduğunuz şirkətləri idarə edin</p>
          </div>
          <Link to="/add-company">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni şirkət əlavə et
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Hələ şirkətiniz yoxdur</h2>
              <p className="text-muted-foreground mb-4">İlk şirkətinizi əlavə edərək başlayın</p>
              <Link to="/add-company">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Şirkət əlavə et
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                            {company.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{company.category}</p>
                      </div>
                    </div>
                    {getStatusBadge(company.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{(company.average_rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">{company.review_count || 0} rəy</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {company.subscription_plan?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/business-dashboard/${company.id}`} className="flex-1">
                      <Button className="w-full" variant="default" disabled={company.status !== 'approved'}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to={`/company/${company.id}`}>
                      <Button variant="outline" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  {company.status === 'pending' && (
                    <p className="text-xs text-muted-foreground text-center">
                      Admin təsdiqi gözlənilir
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyCompaniesPage;
