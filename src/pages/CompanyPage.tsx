import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import TransparencyIndicators from "@/components/TransparencyIndicators";
import RatingChart from "@/components/RatingChart";
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
  Calendar,
  Loader2,
  Heart,
  Star,
  Users,
  BarChart3
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
  owner_id: string | null;
  response_rate: number | null;
  avg_response_time_hours: number | null;
  verified_reviews_count: number | null;
  is_sponsored: boolean | null;
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
  service_rating?: number;
  price_rating?: number;
  speed_rating?: number;
  quality_rating?: number;
  image_url?: string;
  helpful_count?: number;
  company_reply?: string;
  company_reply_at?: string;
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Average criteria ratings
  const [avgServiceRating, setAvgServiceRating] = useState(0);
  const [avgPriceRating, setAvgPriceRating] = useState(0);
  const [avgSpeedRating, setAvgSpeedRating] = useState(0);
  const [avgQualityRating, setAvgQualityRating] = useState(0);

  const isCompanyOwner = user && company?.owner_id === user.id;

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  useEffect(() => {
    if (user && companyId) {
      checkFollowStatus();
    }
  }, [user, companyId]);

  const checkFollowStatus = async () => {
    if (!user || !companyId) return;
    
    const { data } = await supabase
      .from('company_followers')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .maybeSingle();
    
    setIsFollowing(!!data);
  };

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

    // Fetch followers count (we need to count from all users, not just current user)
    // Since RLS only allows users to see their own follows, we'll skip this for now
    // and just show the follow button

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

      // Calculate average criteria ratings
      const withCriteria = reviewsData.filter(r => r.service_rating);
      if (withCriteria.length > 0) {
        setAvgServiceRating(withCriteria.reduce((sum, r) => sum + (r.service_rating || 0), 0) / withCriteria.length);
        setAvgPriceRating(withCriteria.reduce((sum, r) => sum + (r.price_rating || 0), 0) / withCriteria.length);
        setAvgSpeedRating(withCriteria.reduce((sum, r) => sum + (r.speed_rating || 0), 0) / withCriteria.length);
        setAvgQualityRating(withCriteria.reduce((sum, r) => sum + (r.quality_rating || 0), 0) / withCriteria.length);
      }
    } else {
      setReviews([]);
    }

    setLoading(false);
  };

  const handleFollow = async () => {
    if (!user) {
      toast({ title: 'Daxil olun', description: 'İzləmək üçün hesaba daxil olun', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!company) return;

    if (isFollowing) {
      const { error } = await supabase
        .from('company_followers')
        .delete()
        .eq('user_id', user.id)
        .eq('company_id', company.id);

      if (!error) {
        setIsFollowing(false);
        toast({ title: 'İzləmə dayandırıldı' });
      }
    } else {
      const { error } = await supabase
        .from('company_followers')
        .insert({ user_id: user.id, company_id: company.id });

      if (!error) {
        setIsFollowing(true);
        toast({ title: 'Şirkət izlənilir!', description: 'Yeniliklər haqqında məlumatlandırılacaqsınız.' });
      }
    }
  };

  const handleReviewSubmit = async (data: { 
    title: string; 
    content: string; 
    rating: number;
    service_rating: number;
    price_rating: number;
    speed_rating: number;
    quality_rating: number;
    image_url?: string;
  }) => {
    if (!user) {
      toast({ title: 'Rəy yazmaq üçün daxil olun', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!company) return;

    // Check 12-month review limit
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('company_id', company.id)
      .gte('created_at', oneYearAgo.toISOString())
      .limit(1);

    if (checkError) {
      console.error('Review check error:', checkError);
    }

    if (existingReview && existingReview.length > 0) {
      const existingDate = new Date(existingReview[0].created_at);
      const nextAllowedDate = new Date(existingDate);
      nextAllowedDate.setFullYear(nextAllowedDate.getFullYear() + 1);
      
      toast({ 
        title: '12 aylıq limit', 
        description: `Bu şirkət üçün növbəti rəyi ${nextAllowedDate.toLocaleDateString('az-AZ')} tarixindən sonra yaza bilərsiniz.`, 
        variant: 'destructive' 
      });
      return;
    }

    // Get reviewer name for notification
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const reviewerName = profileData?.full_name || 'Anonim istifadəçi';

    const { data: insertedReview, error } = await supabase
      .from('reviews')
      .insert({
        company_id: company.id,
        user_id: user.id,
        title: data.title,
        content: data.content,
        rating: data.rating,
        service_rating: data.service_rating,
        price_rating: data.price_rating,
        speed_rating: data.speed_rating,
        quality_rating: data.quality_rating,
        image_url: data.image_url,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      toast({ title: 'Xəta baş verdi', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Rəyiniz göndərildi!', description: 'Təsdiq edildikdən sonra yayımlanacaq.' });
      setShowReviewForm(false);

      // Call AI analysis on the review (async, don't wait)
      if (insertedReview?.id) {
        supabase.functions.invoke('analyze-review', {
          body: {
            reviewId: insertedReview.id,
            content: data.content,
            companyId: company.id,
            userId: user.id
          }
        }).then(async (response) => {
          if (response.data?.analysis?.is_suspicious && response.data.analysis.confidence > 0.7) {
            // Flag the review as suspicious
            await supabase
              .from('reviews')
              .update({ 
                is_flagged: true, 
                flag_reason: `AI analysis: ${response.data.analysis.reasons?.join(', ') || 'Şübhəli məzmun'}` 
              })
              .eq('id', insertedReview.id);
            console.log('Review flagged as suspicious:', response.data.analysis);
          }
        }).catch(err => {
          console.log('AI analysis failed:', err);
        });
      }

      // Send email notification to company owner (async, don't wait)
      supabase.functions.invoke('notify-company-owner', {
        body: {
          companyId: company.id,
          reviewTitle: data.title,
          reviewerName: reviewerName,
          rating: data.rating
        }
      }).catch(err => {
        console.log('Email notification failed:', err);
      });
    }
  };

  const handleCompanyReply = async (reviewId: string, reply: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ 
        company_reply: reply, 
        company_reply_at: new Date().toISOString() 
      })
      .eq('id', reviewId);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: 'Cavab göndərildi!' });
      fetchCompanyData();

      // Send notification to the review author (async, don't wait)
      supabase.functions.invoke('notify-review-reply', {
        body: {
          reviewId: reviewId,
          companyName: company?.name || '',
          replyContent: reply
        }
      }).catch(err => {
        console.log('Reply notification failed:', err);
      });
    }
  };

  const CriteriaBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

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
                <Button 
                  variant={isFollowing ? "secondary" : "outline"} 
                  size="lg" 
                  onClick={handleFollow}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFollowing ? 'İzlənilir' : 'İzlə'}
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
                        id={review.id}
                        author={review.author_name || 'Anonim'}
                        date={new Date(review.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                        rating={review.rating}
                        text={review.content}
                        helpful={review.helpful_count || 0}
                        hasReceipt={!!review.image_url}
                        imageUrl={review.image_url}
                        serviceRating={review.service_rating}
                        priceRating={review.price_rating}
                        speedRating={review.speed_rating}
                        qualityRating={review.quality_rating}
                        companyReply={review.company_reply}
                        companyReplyAt={review.company_reply_at}
                        isCompanyOwner={isCompanyOwner}
                        onReplySubmit={handleCompanyReply}
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
                <h3 className="font-semibold text-lg text-foreground mb-4">Ümumi Reytinq</h3>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {(company.average_rating || 0).toFixed(1)}
                  </div>
                  <StarRating rating={company.average_rating || 0} size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">{company.review_count || 0} rəy əsasında</p>
                </div>

                {/* Criteria breakdown */}
                {(avgServiceRating > 0 || avgPriceRating > 0) && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-sm text-foreground mb-3">Meyarlar üzrə</h4>
                    <CriteriaBar label="Xidmət" value={avgServiceRating} />
                    <CriteriaBar label="Qiymət" value={avgPriceRating} />
                    <CriteriaBar label="Sürət" value={avgSpeedRating} />
                    <CriteriaBar label="Keyfiyyət" value={avgQualityRating} />
                  </div>
                )}
              </div>

              {/* Rating Chart */}
              {reviews.length > 0 && (
                <RatingChart 
                  reviews={reviews} 
                  averageRating={company.average_rating || 0} 
                />
              )}

              {/* Transparency Indicators */}
              <TransparencyIndicators
                responseRate={company.response_rate}
                avgResponseTimeHours={company.avg_response_time_hours}
                verifiedReviewsCount={company.verified_reviews_count}
                totalReviewCount={company.review_count}
                isSponsored={company.is_sponsored || false}
              />

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

                  {/* Dashboard link for owners */}
                  {isCompanyOwner && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate(`/dashboard/${company.id}`)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard-a keç
                    </Button>
                  )}
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
