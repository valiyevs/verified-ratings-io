import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Globe, 
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Loader2
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: string;
  average_rating: number | null;
  review_count: number | null;
  created_at: string;
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  created_at: string;
  user_id: string;
  author_name?: string;
}

const CompanyPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

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
      setNotFound(true);
      setLoading(false);
      return;
    }

    setCompany(companyData);

    // Fetch approved reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      // Get author names from profiles
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const reviewsWithAuthors = reviewsData.map(review => ({
        ...review,
        author_name: profiles?.find(p => p.user_id === review.user_id)?.full_name || 'Anonim'
      }));
      setReviews(reviewsWithAuthors);
    } else {
      setReviews([]);
    }

    setLoading(false);
  };

  const handleReviewSubmit = async (data: { title: string; content: string; rating: number }) => {
    if (!user) {
      toast({ title: 'Rəy yazmaq üçün daxil olun', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!company) return;

    const { error } = await supabase
      .from('reviews')
      .insert({
        company_id: company.id,
        user_id: user.id,
        title: data.title,
        content: data.content,
        rating: data.rating,
        status: 'pending'
      });

    if (error) {
      toast({ title: 'Xəta baş verdi', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Rəyiniz göndərildi!', description: 'Təsdiq edildikdən sonra yayımlanacaq.' });
      setShowReviewForm(false);
    }
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

  if (notFound || !company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Şirkət tapılmadı</h1>
            <p className="text-muted-foreground mb-8">Bu şirkət mövcud deyil və ya silinib.</p>
            <Link to="/search">
              <Button>Şirkətlərə bax</Button>
            </Link>
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
          {/* Back button */}
          <Link 
            to="/search" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Şirkətlərə qayıt
          </Link>

          {/* Company Header */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card mb-8 border border-border/50">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{company.name.charAt(0)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    {company.name}
                  </h1>
                  {company.status === 'approved' && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-sm">{company.category}</Badge>
                  <div className="flex items-center gap-2">
                    <StarRating rating={company.average_rating || 0} size="lg" />
                    <span className="text-muted-foreground">({company.review_count || 0} rəy)</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 max-w-2xl">
                  {company.description || 'Şirkət haqqında məlumat yoxdur.'}
                </p>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  {company.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {company.address}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {company.phone}
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      {company.website}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 md:items-end">
                <Button variant="hero" size="lg" onClick={() => setShowReviewForm(true)}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Rəy yaz
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Reviews */}
            <div className="lg:col-span-2 space-y-6">
              {/* Review Form */}
              {showReviewForm && (
                <ReviewForm 
                  companyName={company.name} 
                  companyId={company.id}
                  onClose={() => setShowReviewForm(false)}
                  onSubmit={handleReviewSubmit}
                />
              )}

              {/* Reviews list */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Son Rəylər
                </h2>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard 
                        key={review.id} 
                        author={review.author_name || 'Anonim'}
                        date={new Date(review.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        rating={review.rating}
                        text={review.content}
                        helpful={0}
                        hasReceipt={false}
                      />
                    ))
                  ) : (
                    <div className="bg-card rounded-xl p-8 text-center border border-border/50">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Bu şirkət haqqında hələ rəy yoxdur. İlk rəyi siz yazın!
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowReviewForm(true)}>
                        Rəy yaz
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Rating breakdown */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-4">Reytinq</h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {(company.average_rating || 0).toFixed(1)}
                  </div>
                  <StarRating rating={company.average_rating || 0} size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">{company.review_count || 0} rəy əsasında</p>
                </div>
              </div>

              {/* Company stats */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <h3 className="font-semibold text-lg text-foreground mb-4">Şirkət Məlumatları</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Qeydiyyat tarixi</p>
                      <p className="font-medium text-foreground">
                        {new Date(company.created_at).toLocaleDateString('az-AZ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ümumi rəylər</p>
                      <p className="font-medium text-foreground">{company.review_count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyPage;
