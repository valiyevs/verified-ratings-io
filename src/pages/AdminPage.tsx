import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Building2, MessageSquare, Users, Check, X, Loader2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  category: string;
  status: string;
  created_at: string;
  owner_id: string | null;
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
    
    setCompanies(companiesData || []);

    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    setReviews(reviewsData || []);

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

  const updateCompanyStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('companies')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: status === 'approved' ? 'Şirkət təsdiqləndi' : 'Şirkət rədd edildi' });
      fetchData();
    }
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: status === 'approved' ? 'Rəy təsdiqləndi' : 'Rəy rədd edildi' });
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
      
      <main className="container mx-auto px-4 py-8">
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

        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="companies">Şirkətlər</TabsTrigger>
            <TabsTrigger value="reviews">Rəylər</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">İstifadəçilər</TabsTrigger>}
          </TabsList>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Şirkət İdarəetməsi</CardTitle>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Tarix</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.category}</TableCell>
                          <TableCell>{getStatusBadge(company.status)}</TableCell>
                          <TableCell>{new Date(company.created_at).toLocaleDateString('az-AZ')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {company.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateCompanyStatus(company.id, 'approved')}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateCompanyStatus(company.id, 'rejected')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
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

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Rəy İdarəetməsi</CardTitle>
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
                        <TableHead>Məzmun</TableHead>
                        <TableHead>Reytinq</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tarix</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                          <TableCell>{'⭐'.repeat(review.rating)}</TableCell>
                          <TableCell>{getStatusBadge(review.status)}</TableCell>
                          <TableCell>{new Date(review.created_at).toLocaleDateString('az-AZ')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {review.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateReviewStatus(review.id, 'approved')}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
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
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
