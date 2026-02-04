import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, Star, Building2, Edit, Save, Loader2, Heart, X, Bell, Mail, Gift, Scale } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RewardsCenter } from '@/components/customer/RewardsCenter';
import { ReviewComparison } from '@/components/customer/ReviewComparison';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  email_notifications_enabled: boolean | null;
  review_reply_notifications: boolean | null;
  company_update_notifications: boolean | null;
  trust_score: number | null;
  is_fin_verified: boolean | null;
  total_reviews_count: number | null;
  platform_activity_months: number | null;
}

interface UserReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  created_at: string;
  company_id: string;
  company_name?: string;
}

interface UserCompany {
  id: string;
  name: string;
  category: string;
  status: string;
  average_rating: number;
  review_count: number;
  created_at: string;
}

interface FollowedCompany {
  id: string;
  company_id: string;
  created_at: string;
  company?: {
    id: string;
    name: string;
    category: string;
    logo_url: string | null;
    average_rating: number | null;
    review_count: number | null;
  };
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || '');
    }

    // Fetch user's reviews with company names
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      // Get company names
      const companyIds = [...new Set(reviewsData.map(r => r.company_id))];
      const { data: companiesForReviews } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      const reviewsWithCompanies = reviewsData.map(review => ({
        ...review,
        company_name: companiesForReviews?.find(c => c.id === review.company_id)?.name || 'Naməlum'
      }));
      setReviews(reviewsWithCompanies);
    } else {
      setReviews([]);
    }

    // Fetch user's companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
    
    setCompanies(companiesData || []);

    // Fetch followed companies
    const { data: followsData } = await supabase
      .from('company_followers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (followsData && followsData.length > 0) {
      const followedCompanyIds = followsData.map(f => f.company_id);
      const { data: followedCompaniesData } = await supabase
        .from('companies')
        .select('id, name, category, logo_url, average_rating, review_count')
        .in('id', followedCompanyIds)
        .eq('status', 'approved');

      const followsWithCompanies = followsData.map(follow => ({
        ...follow,
        company: followedCompaniesData?.find(c => c.id === follow.company_id)
      }));
      setFollowedCompanies(followsWithCompanies.filter(f => f.company));
    } else {
      setFollowedCompanies([]);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: 'Profil yeniləndi' });
      setEditing(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleUnfollow = async (companyId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('company_followers')
      .delete()
      .eq('user_id', user.id)
      .eq('company_id', companyId);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: 'Şirkət izləmədən çıxarıldı' });
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      pending: 'Gözləyir',
      approved: 'Təsdiqlənib',
      rejected: 'Rədd edilib',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ad Soyad"
                          className="w-48"
                        />
                        <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <h1 className="text-2xl font-bold">{profile?.full_name || 'İstifadəçi'}</h1>
                    )}
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Redaktə et
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trust Score Section */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Güvən Balı</h3>
                      <p className="text-xs text-muted-foreground">Platformadakı etibarlılığınız</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {profile?.trust_score ? Math.round(profile.trust_score * 100) : 100}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.is_fin_verified ? '✓ FIN Təsdiqli' : 'Təsdiqlənməyib'}
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-secondary rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(profile?.trust_score || 1) * 100}%` }}
                  />
                </div>
                
                {/* How to increase trust score */}
                <div className="bg-background/50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-foreground mb-2">Güvən balınızı necə artıra bilərsiniz:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={profile?.is_fin_verified ? 'text-green-500' : ''}>•</span>
                      FIN kodu ilə hesabınızı təsdiqləyin (+20%)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={(profile?.total_reviews_count || 0) >= 5 ? 'text-green-500' : ''}>•</span>
                      5+ keyfiyyətli rəy yazın (+15%)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={(profile?.platform_activity_months || 0) >= 6 ? 'text-green-500' : ''}>•</span>
                      6+ ay aktiv olun (+10%)
                    </li>
                    <li className="flex items-center gap-2">
                      <span>•</span>
                      Rəylərinizə qəbz/şəkil əlavə edin (+5%)
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground">Rəylər</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{companies.length}</p>
                  <p className="text-sm text-muted-foreground">Şirkətlər</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{followedCompanies.length}</p>
                  <p className="text-sm text-muted-foreground">İzlənənlər</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('az-AZ') : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">Qeydiyyat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Reviews, Companies and Followed */}
          <Tabs defaultValue="reviews" className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 mr-2" />
                Rəylərim ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="companies">
                <Building2 className="h-4 w-4 mr-2" />
                Şirkətlərim ({companies.length})
              </TabsTrigger>
              <TabsTrigger value="followed">
                <Heart className="h-4 w-4 mr-2" />
                İzlədiklərim ({followedCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <Gift className="h-4 w-4 mr-2" />
                Mükafatlar
              </TabsTrigger>
              <TabsTrigger value="compare">
                <Scale className="h-4 w-4 mr-2" />
                Müqayisə
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Bell className="h-4 w-4 mr-2" />
                Bildirişlər
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Hələ heç bir rəy yazmamısınız</p>
                    <Button className="mt-4" onClick={() => navigate('/search')}>
                      Şirkətlərə bax
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{review.company_name}</span>
                              {getStatusBadge(review.status)}
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <h3 className="font-medium">{review.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{review.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('az-AZ')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="companies">
              {companies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Hələ heç bir şirkət qeydiyyatdan keçirməmisiniz</p>
                    <Button className="mt-4" onClick={() => navigate('/add-company')}>
                      Şirkət əlavə et
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/company/${company.id}`)}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{company.name}</span>
                              {getStatusBadge(company.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{company.category}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                {company.average_rating?.toFixed(1) || '0.0'}
                              </span>
                              <span>{company.review_count || 0} rəy</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(company.created_at).toLocaleDateString('az-AZ')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="followed">
              {followedCompanies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Hələ heç bir şirkət izləmirsiniz</p>
                    <Button className="mt-4" onClick={() => navigate('/search')}>
                      Şirkətlərə bax
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {followedCompanies.map((follow) => (
                    <Card key={follow.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-4 cursor-pointer flex-1"
                            onClick={() => navigate(`/company/${follow.company?.id}`)}
                          >
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {follow.company?.logo_url ? (
                                <img 
                                  src={follow.company.logo_url} 
                                  alt={follow.company.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold hover:text-primary transition-colors">
                                {follow.company?.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{follow.company?.category}</p>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  {follow.company?.average_rating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-muted-foreground">
                                  {follow.company?.review_count || 0} rəy
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(follow.created_at).toLocaleDateString('az-AZ')}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnfollow(follow.company_id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards">
              <RewardsCenter />
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="compare">
              <ReviewComparison />
            </TabsContent>

            {/* Notification Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Bildiriş Parametrləri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="font-medium">E-poçt bildirişləri</Label>
                        <p className="text-sm text-muted-foreground">Bütün e-poçt bildirişlərini aktiv/deaktiv edin</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile?.email_notifications_enabled ?? true}
                      onCheckedChange={async (checked) => {
                        if (!user) return;
                        const { error } = await supabase
                          .from('profiles')
                          .update({ email_notifications_enabled: checked })
                          .eq('user_id', user.id);
                        if (!error) {
                          setProfile(prev => prev ? { ...prev, email_notifications_enabled: checked } : null);
                          toast({ title: checked ? 'E-poçt bildirişləri aktiv edildi' : 'E-poçt bildirişləri deaktiv edildi' });
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <Label className="font-medium">Rəy cavabı bildirişləri</Label>
                        <p className="text-sm text-muted-foreground">Şirkət rəyinizə cavab verdikdə bildiriş alın</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile?.review_reply_notifications ?? true}
                      disabled={!profile?.email_notifications_enabled}
                      onCheckedChange={async (checked) => {
                        if (!user) return;
                        const { error } = await supabase
                          .from('profiles')
                          .update({ review_reply_notifications: checked })
                          .eq('user_id', user.id);
                        if (!error) {
                          setProfile(prev => prev ? { ...prev, review_reply_notifications: checked } : null);
                          toast({ title: checked ? 'Rəy cavabı bildirişləri aktiv edildi' : 'Rəy cavabı bildirişləri deaktiv edildi' });
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label className="font-medium">Şirkət yenilikləri</Label>
                        <p className="text-sm text-muted-foreground">İzlədiyiniz şirkətlərdən yeniliklər alın</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile?.company_update_notifications ?? true}
                      disabled={!profile?.email_notifications_enabled}
                      onCheckedChange={async (checked) => {
                        if (!user) return;
                        const { error } = await supabase
                          .from('profiles')
                          .update({ company_update_notifications: checked })
                          .eq('user_id', user.id);
                        if (!error) {
                          setProfile(prev => prev ? { ...prev, company_update_notifications: checked } : null);
                          toast({ title: checked ? 'Şirkət bildirişləri aktiv edildi' : 'Şirkət bildirişləri deaktiv edildi' });
                        }
                      }}
                    />
                  </div>

                  {!profile?.email_notifications_enabled && (
                    <p className="text-sm text-muted-foreground text-center">
                      Digər bildiriş seçimlərini aktivləşdirmək üçün əvvəlcə e-poçt bildirişlərini aktiv edin.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
