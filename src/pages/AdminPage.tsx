import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Building2, MessageSquare, Users, Check, X, Loader2, Eye, Image, Star, ExternalLink, AlertTriangle, Flag, CreditCard, Crown, Sparkles, BarChart3, Clock, UserPlus, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { getPlanName, getPlanBadgeVariant, type SubscriptionPlan } from '@/lib/subscriptionPermissions';
import { CompanyMemberManager } from '@/components/admin/CompanyMemberManager';

interface Company {
  id: string;
  name: string;
  category: string;
  status: string;
  created_at: string;
  owner_id: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  average_rating: number | null;
  review_count: number | null;
  owner_name?: string;
  owner_email?: string;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  created_at: string;
  company_id: string;
  user_id: string;
  image_url: string | null;
  service_rating: number | null;
  price_rating: number | null;
  speed_rating: number | null;
  quality_rating: number | null;
  helpful_count: number | null;
  is_flagged: boolean | null;
  flag_reason: string | null;
  company_name?: string;
  reviewer_name?: string;
  reviewer_email?: string;
}

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isModerator, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Company detail dialog
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyStatusNote, setCompanyStatusNote] = useState('');

  // Owner change states
  const [ownerSearchEmail, setOwnerSearchEmail] = useState('');
  const [ownerSearchResults, setOwnerSearchResults] = useState<{user_id: string, full_name: string | null, email: string | null}[]>([]);
  const [searchingOwner, setSearchingOwner] = useState(false);
  const [changingOwner, setChangingOwner] = useState(false);

  // Review detail dialog
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isModerator) {
        navigate('/');
        toast({
          title: 'İcazə yoxdur',
          description: 'Bu səhifəyə giriş üçün admin və ya moderator olmalısınız.',
          variant: 'destructive',
        });
      }
    }
  }, [user, authLoading, roleLoading, isModerator, navigate]);

  useEffect(() => {
    if (isModerator) {
      fetchData();
    }
  }, [isModerator]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    // Get owner info for companies
    if (companiesData) {
      const ownerIds = [...new Set(companiesData.filter(c => c.owner_id).map(c => c.owner_id))];
      const { data: ownerProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', ownerIds);

      const companiesWithOwners = companiesData.map(company => ({
        ...company,
        owner_name: ownerProfiles?.find(p => p.user_id === company.owner_id)?.full_name || undefined,
        owner_email: ownerProfiles?.find(p => p.user_id === company.owner_id)?.email || undefined,
      }));
      setCompanies(companiesWithOwners);
    }

    // Fetch reviews with company and user info
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (reviewsData) {
      // Get company names
      const companyIds = [...new Set(reviewsData.map(r => r.company_id))];
      const { data: companiesForReviews } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      // Get reviewer info
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: reviewerProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const reviewsWithInfo = reviewsData.map(review => ({
        ...review,
        company_name: companiesForReviews?.find(c => c.id === review.company_id)?.name || 'Naməlum',
        reviewer_name: reviewerProfiles?.find(p => p.user_id === review.user_id)?.full_name || undefined,
        reviewer_email: reviewerProfiles?.find(p => p.user_id === review.user_id)?.email || undefined,
      }));
      setReviews(reviewsWithInfo);
    }

    // Fetch users with profiles
    if (isAdmin) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*');

      const usersWithRoles: UserWithRole[] = (profilesData || []).map(profile => ({
        id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: (rolesData || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role),
      }));

      setUsers(usersWithRoles);
    }

    setLoading(false);
  };

  const updateCompanyStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('companies')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      const statusLabels: Record<string, string> = {
        approved: 'təsdiqləndi',
        rejected: 'rədd edildi',
        pending: 'gözləməyə alındı',
      };
      toast({ title: `Şirkət ${statusLabels[status]}` });
      setCompanyDialogOpen(false);
      fetchData();
    }
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      const statusLabels: Record<string, string> = {
        approved: 'təsdiqləndi',
        rejected: 'rədd edildi',
        pending: 'gözləməyə alındı',
      };
      toast({ title: `Rəy ${statusLabels[status]}` });
      setReviewDialogOpen(false);
      fetchData();
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user', add: boolean) => {
    if (add) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        toast({ title: 'Xəta baş verdi', variant: 'destructive' });
      } else {
        toast({ title: `${role} rolu əlavə edildi` });
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        toast({ title: 'Xəta baş verdi', variant: 'destructive' });
      } else {
        toast({ title: `${role} rolu silindi` });
        fetchData();
      }
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

  const renderStarRating = (rating: number | null, label: string) => {
    if (rating === null) return null;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">({rating})</span>
      </div>
    );
  };

  const openCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setCompanyStatusNote('');
    setCompanyDialogOpen(true);
  };

  const openReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setReviewDialogOpen(true);
  };

  const openImagePreview = (url: string) => {
    setPreviewImageUrl(url);
    setImagePreviewOpen(true);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Şirkətlər</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                {companies.filter(c => c.status === 'pending').length} gözləyir
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rəylər</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs text-muted-foreground">
                {reviews.filter(r => r.status === 'pending').length} gözləyir
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">İstifadəçilər</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.roles.includes('admin') || u.roles.includes('moderator')).length} admin/moderator
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="companies">Şirkətlər</TabsTrigger>
            <TabsTrigger value="reviews">Rəylər</TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Şübhəli ({reviews.filter(r => r.is_flagged).length})
            </TabsTrigger>
            {isAdmin && <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Paketlər
            </TabsTrigger>}
            {isAdmin && <TabsTrigger value="users">İstifadəçilər</TabsTrigger>}
            {isAdmin && <TabsTrigger value="members" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Şirkət Üzvləri
            </TabsTrigger>}
            {isAdmin && <TabsTrigger value="audit" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Audit Log
            </TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboardStats />
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Şirkət İdarəetməsi</CardTitle>
                <CardDescription>Şirkətlərin ətraflı məlumatlarını görmək üçün "Bax" düyməsinə klikləyin</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : companies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Heç bir şirkət yoxdur</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad</TableHead>
                        <TableHead>Kateqoriya</TableHead>
                        <TableHead>Sahib</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reytinq</TableHead>
                        <TableHead>Tarix</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.category}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{company.owner_name || 'Naməlum'}</p>
                              {company.owner_email && (
                                <p className="text-xs text-muted-foreground">{company.owner_email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(company.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{company.average_rating?.toFixed(1) || '0.0'}</span>
                              <span className="text-xs text-muted-foreground">({company.review_count || 0})</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(company.created_at).toLocaleDateString('az-AZ')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openCompanyDetails(company)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/company/${company.id}`)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Rəy İdarəetməsi</CardTitle>
                <CardDescription>Rəylərin ətraflı məlumatlarını görmək üçün "Bax" düyməsinə klikləyin</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Heç bir rəy yoxdur</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Başlıq</TableHead>
                        <TableHead>Şirkət</TableHead>
                        <TableHead>Yazan</TableHead>
                        <TableHead>Reytinq</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Şəkil</TableHead>
                        <TableHead>Tarix</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium max-w-[150px] truncate">{review.title}</TableCell>
                          <TableCell>{review.company_name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{review.reviewer_name || 'Anonim'}</p>
                              {review.reviewer_email && (
                                <p className="text-xs text-muted-foreground">{review.reviewer_email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{review.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(review.status)}</TableCell>
                          <TableCell>
                            {review.image_url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openImagePreview(review.image_url!)}
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(review.created_at).toLocaleDateString('az-AZ')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReviewDetails(review)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Reviews Tab */}
          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  AI Tərəfindən Flag Edilmiş Rəylər
                </CardTitle>
                <CardDescription>
                  Bu rəylər AI analizi nəticəsində şübhəli olaraq qeyd edilib. Diqqətlə yoxlayın.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : reviews.filter(r => r.is_flagged).length === 0 ? (
                  <div className="text-center py-12">
                    <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Şübhəli rəy yoxdur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.filter(r => r.is_flagged).map((review) => (
                      <div key={review.id} className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{review.title}</h4>
                              {getStatusBadge(review.status)}
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Şübhəli
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.company_name} • {review.reviewer_name || 'Anonim'} • {new Date(review.created_at).toLocaleDateString('az-AZ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{review.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3">{review.content}</p>
                        
                        {review.flag_reason && (
                          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              AI Analiz Nəticəsi:
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{review.flag_reason}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateReviewStatus(review.id, 'approved')}
                            className="flex items-center gap-1"
                          >
                            <Check className="h-4 w-4" />
                            Təsdiqlə
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                            className="flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            Rədd et
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDetails(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          {isAdmin && (
            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Şirkət Paketləri İdarəetməsi
                  </CardTitle>
                  <CardDescription>
                    Şirkətlərə abunəlik planları təyin edin. Hər plan fərqli səlahiyyətlər verir.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : companies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Heç bir şirkət yoxdur</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Şirkət</TableHead>
                          <TableHead>Kateqoriya</TableHead>
                          <TableHead>Hazırkı Plan</TableHead>
                          <TableHead>Bitmə tarixi</TableHead>
                          <TableHead>Plan dəyişdir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.filter(c => c.status === 'approved').map((company) => (
                          <TableRow key={company.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">{company.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{company.name}</p>
                                  {company.owner_name && (
                                    <p className="text-xs text-muted-foreground">{company.owner_name}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{company.category}</TableCell>
                            <TableCell>
                              <Badge variant={getPlanBadgeVariant(company.subscription_plan)} className="flex items-center gap-1 w-fit">
                                {company.subscription_plan === 'enterprise' && <Crown className="h-3 w-3" />}
                                {company.subscription_plan === 'pro' && <Sparkles className="h-3 w-3" />}
                                {getPlanName(company.subscription_plan)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {company.subscription_expires_at ? (
                                <span className={new Date(company.subscription_expires_at) < new Date() ? 'text-destructive' : ''}>
                                  {new Date(company.subscription_expires_at).toLocaleDateString('az-AZ')}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={company.subscription_plan || 'free'}
                                onValueChange={async (newPlan) => {
                                  const expiresAt = new Date();
                                  expiresAt.setMonth(expiresAt.getMonth() + 1);
                                  
                                  const { error } = await supabase
                                    .from('companies')
                                    .update({ 
                                      subscription_plan: newPlan,
                                      subscription_expires_at: newPlan !== 'free' ? expiresAt.toISOString() : null
                                    })
                                    .eq('id', company.id);
                                  
                                  if (error) {
                                    toast({ title: 'Xəta baş verdi', variant: 'destructive' });
                                  } else {
                                    toast({ title: `${company.name} üçün ${getPlanName(newPlan)} planı aktivləşdirildi` });
                                    fetchData();
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4" />
                                      Free
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="pro">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-blue-500" />
                                      Pro
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="enterprise">
                                    <div className="flex items-center gap-2">
                                      <Crown className="h-4 w-4 text-yellow-500" />
                                      Enterprise
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {/* Plan Permissions Info */}
                  <div className="mt-8 grid md:grid-cols-3 gap-4">
                    <Card className="border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Free Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Əsas profil</p>
                        <p>✓ Rəylərə cavab vermək</p>
                        <p>✓ 10 rəy limiti/ay</p>
                        <p>✗ AI analiz</p>
                        <p>✗ Sorğu yaratmaq</p>
                      </CardContent>
                    </Card>
                    <Card className="border-blue-500/30 bg-blue-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-500" />
                          Pro Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Free-dəki hər şey</p>
                        <p>✓ Limitsiz rəy</p>
                        <p>✓ Detallı analitika</p>
                        <p>✓ AI açar söz analizi</p>
                        <p>✓ 5 sorğu/ay</p>
                      </CardContent>
                    </Card>
                    <Card className="border-yellow-500/30 bg-yellow-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          Enterprise Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground space-y-1">
                        <p>✓ Pro-dakı hər şey</p>
                        <p>✓ Limitsiz sorğu</p>
                        <p>✓ API girişi</p>
                        <p>✓ Xüsusi AI hesabatlar</p>
                        <p>✓ Dedikasiyalı meneger</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>İstifadəçi İdarəetməsi</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Heç bir istifadəçi yoxdur</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ad</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rollar</TableHead>
                          <TableHead>Qeydiyyat</TableHead>
                          <TableHead>Əməliyyatlar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userItem) => (
                          <TableRow key={userItem.id}>
                            <TableCell className="font-medium">{userItem.full_name || 'N/A'}</TableCell>
                            <TableCell>{userItem.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {userItem.roles.length === 0 ? (
                                  <Badge variant="outline">İstifadəçi</Badge>
                                ) : (
                                  userItem.roles.map(role => (
                                    <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                                      {role}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{new Date(userItem.created_at).toLocaleDateString('az-AZ')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {!userItem.roles.includes('moderator') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateUserRole(userItem.id, 'moderator', true)}
                                  >
                                    +Mod
                                  </Button>
                                )}
                                {userItem.roles.includes('moderator') && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateUserRole(userItem.id, 'moderator', false)}
                                  >
                                    -Mod
                                  </Button>
                                )}
                                {!userItem.roles.includes('admin') && userItem.id !== user?.id && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateUserRole(userItem.id, 'admin', true)}
                                  >
                                    +Admin
                                  </Button>
                                )}
                                {userItem.roles.includes('admin') && userItem.id !== user?.id && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateUserRole(userItem.id, 'admin', false)}
                                  >
                                    -Admin
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="members">
              <CompanyMemberManager />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Footer />

      {/* Company Detail Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Şirkət Ətraflı Məlumat</DialogTitle>
            <DialogDescription>Şirkətin bütün məlumatlarını burada görə bilərsiniz</DialogDescription>
          </DialogHeader>
          
          {selectedCompany && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Şirkət adı</Label>
                  <p className="font-medium">{selectedCompany.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kateqoriya</Label>
                  <p>{selectedCompany.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qeydiyyat tarixi</Label>
                  <p>{new Date(selectedCompany.created_at).toLocaleDateString('az-AZ')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Sahib Məlumatları</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label className="text-muted-foreground">Ad Soyad</Label>
                    <p>{selectedCompany.owner_name || 'Naməlum'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedCompany.owner_email || 'Naməlum'}</p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <RefreshCw className="h-3 w-3" />
                      Sahibi Dəyişdir
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="E-poçt və ya ad ilə axtar..."
                        value={ownerSearchEmail}
                        onChange={(e) => setOwnerSearchEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && ownerSearchEmail.trim()) {
                            setSearchingOwner(true);
                            supabase
                              .from('profiles')
                              .select('user_id, full_name, email')
                              .or(`email.ilike.%${ownerSearchEmail}%,full_name.ilike.%${ownerSearchEmail}%`)
                              .limit(5)
                              .then(({ data }) => {
                                setOwnerSearchResults(data || []);
                                setSearchingOwner(false);
                              });
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={searchingOwner}
                        onClick={() => {
                          if (!ownerSearchEmail.trim()) return;
                          setSearchingOwner(true);
                          supabase
                            .from('profiles')
                            .select('user_id, full_name, email')
                            .or(`email.ilike.%${ownerSearchEmail}%,full_name.ilike.%${ownerSearchEmail}%`)
                            .limit(5)
                            .then(({ data }) => {
                              setOwnerSearchResults(data || []);
                              setSearchingOwner(false);
                            });
                        }}
                      >
                        {searchingOwner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    {ownerSearchResults.length > 0 && (
                      <div className="border rounded-md divide-y max-h-36 overflow-y-auto">
                        {ownerSearchResults.map(u => (
                          <button
                            key={u.user_id}
                            className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm flex items-center justify-between"
                            disabled={changingOwner}
                            onClick={async () => {
                              setChangingOwner(true);
                              const { error } = await supabase
                                .from('companies')
                                .update({ owner_id: u.user_id })
                                .eq('id', selectedCompany.id);
                              if (error) {
                                toast({ title: 'Xəta baş verdi', variant: 'destructive' });
                              } else {
                                toast({ title: `Sahib ${u.full_name || u.email} olaraq dəyişdirildi` });
                                setOwnerSearchEmail('');
                                setOwnerSearchResults([]);
                                setCompanyDialogOpen(false);
                                fetchData();
                              }
                              setChangingOwner(false);
                            }}
                          >
                            <div>
                              <p className="font-medium">{u.full_name || 'Adsız'}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">Seç</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Əlaqə Məlumatları</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedCompany.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefon</Label>
                    <p>{selectedCompany.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Vebsayt</Label>
                    <p>{selectedCompany.website || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ünvan</Label>
                    <p>{selectedCompany.address || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Statistika</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Orta reytinq</Label>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{selectedCompany.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Rəy sayı</Label>
                    <p className="font-medium">{selectedCompany.review_count || 0}</p>
                  </div>
                </div>
              </div>

              {selectedCompany.description && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Təsvir</h4>
                  <p className="text-sm">{selectedCompany.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Status dəyişdir</h4>
                <div className="flex gap-2">
                  <Button
                    variant={selectedCompany.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => updateCompanyStatus(selectedCompany.id, 'pending')}
                    disabled={selectedCompany.status === 'pending'}
                  >
                    Gözləməyə al
                  </Button>
                  <Button
                    variant={selectedCompany.status === 'approved' ? 'default' : 'outline'}
                    onClick={() => updateCompanyStatus(selectedCompany.id, 'approved')}
                    disabled={selectedCompany.status === 'approved'}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Təsdiqlə
                  </Button>
                  <Button
                    variant={selectedCompany.status === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => updateCompanyStatus(selectedCompany.id, 'rejected')}
                    disabled={selectedCompany.status === 'rejected'}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rədd et
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Detail Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rəy Ətraflı Məlumat</DialogTitle>
            <DialogDescription>Rəyin bütün məlumatlarını burada görə bilərsiniz</DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Başlıq</Label>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Şirkət</Label>
                  <p>{selectedReview.company_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tarix</Label>
                  <p>{new Date(selectedReview.created_at).toLocaleDateString('az-AZ')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Yazan Haqqında</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Ad Soyad</Label>
                    <p>{selectedReview.reviewer_name || 'Anonim'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedReview.reviewer_email || 'Naməlum'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Reytinqlər</h4>
                <div className="space-y-2">
                  {renderStarRating(selectedReview.rating, 'Ümumi')}
                  {renderStarRating(selectedReview.service_rating, 'Xidmət')}
                  {renderStarRating(selectedReview.price_rating, 'Qiymət')}
                  {renderStarRating(selectedReview.speed_rating, 'Sürət')}
                  {renderStarRating(selectedReview.quality_rating, 'Keyfiyyət')}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Rəy Məzmunu</h4>
                <p className="text-sm bg-muted p-4 rounded-lg">{selectedReview.content}</p>
              </div>

              {selectedReview.image_url && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Əlavə edilən şəkil</h4>
                  <img 
                    src={selectedReview.image_url} 
                    alt="Rəy şəkli" 
                    className="max-h-64 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImagePreview(selectedReview.image_url!)}
                  />
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Faydalılıq</h4>
                <p className="text-sm">{selectedReview.helpful_count || 0} nəfər faydalı hesab etdi</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Status dəyişdir</h4>
                <div className="flex gap-2">
                  <Button
                    variant={selectedReview.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => updateReviewStatus(selectedReview.id, 'pending')}
                    disabled={selectedReview.status === 'pending'}
                  >
                    Gözləməyə al
                  </Button>
                  <Button
                    variant={selectedReview.status === 'approved' ? 'default' : 'outline'}
                    onClick={() => updateReviewStatus(selectedReview.id, 'approved')}
                    disabled={selectedReview.status === 'approved'}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Təsdiqlə
                  </Button>
                  <Button
                    variant={selectedReview.status === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => updateReviewStatus(selectedReview.id, 'rejected')}
                    disabled={selectedReview.status === 'rejected'}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rədd et
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Şəkil önizləməsi</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={previewImageUrl} 
              alt="Böyük şəkil" 
              className="max-h-[70vh] rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
