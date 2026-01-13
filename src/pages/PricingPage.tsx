import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Star, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Sparkles,
  Shield,
  Zap,
  Building2,
  Loader2
} from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  icon: React.ReactNode;
}

interface UserCompany {
  id: string;
  name: string;
  subscription_plan: string | null;
}

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserCompanies();
    }
  }, [user]);

  const fetchUserCompanies = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('companies')
      .select('id, name, subscription_plan')
      .eq('owner_id', user.id)
      .eq('status', 'approved');
    
    if (data) {
      setUserCompanies(data);
      if (data.length === 1) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '₼0',
      period: '/ay',
      description: 'Kiçik bizneslər üçün başlanğıc',
      icon: <Building2 className="h-6 w-6" />,
      features: [
        { text: 'Şirkət profili', included: true },
        { text: 'Rəylərə cavab vermək', included: true },
        { text: 'Əsas statistika', included: true },
        { text: 'Aylıq 10 rəy limiti', included: true },
        { text: 'Detallı analitika', included: false },
        { text: 'AI açar söz analizi', included: false },
        { text: 'Prioritet dəstək', included: false },
        { text: 'Sorğu yaratmaq', included: false },
        { text: 'API girişi', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₼49',
      period: '/ay',
      description: 'Böyüyən bizneslər üçün',
      icon: <Star className="h-6 w-6" />,
      popular: true,
      features: [
        { text: 'Free planın bütün xüsusiyyətləri', included: true },
        { text: 'Limitsiz rəy', included: true },
        { text: 'Detallı analitika dashboardu', included: true },
        { text: 'AI açar söz analizi', included: true },
        { text: 'Meyar üzrə trend analizi', included: true },
        { text: 'Prioritet rəy cavabları', included: true },
        { text: 'E-poçt bildirişləri', included: true },
        { text: 'Sorğu yaratmaq (5/ay)', included: true },
        { text: 'API girişi', included: false },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₼149',
      period: '/ay',
      description: 'Böyük şirkətlər və korporasiyalar üçün',
      icon: <Shield className="h-6 w-6" />,
      features: [
        { text: 'Pro planın bütün xüsusiyyətləri', included: true },
        { text: 'Limitsiz sorğu', included: true },
        { text: 'API girişi', included: true },
        { text: 'Xüsusi AI hesabatları', included: true },
        { text: 'Dedikasiyalı meneger', included: true },
        { text: 'SLA zəmanəti', included: true },
        { text: 'Çoxlu şirkət idarəetməsi', included: true },
        { text: 'Sektor hesabatları', included: true },
        { text: 'White-label seçimləri', included: true },
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      toast({ title: 'Daxil olun', description: 'Plan seçmək üçün hesaba daxil olun', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (userCompanies.length === 0) {
      toast({ title: 'Şirkət yoxdur', description: 'Plan seçmək üçün əvvəlcə şirkət əlavə edin', variant: 'destructive' });
      navigate('/add-company');
      return;
    }

    setSelectedPlan(planId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmPlan = async () => {
    if (!selectedCompanyId || !selectedPlan) return;
    
    setLoading(true);
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase
      .from('companies')
      .update({ 
        subscription_plan: selectedPlan,
        subscription_expires_at: expiresAt.toISOString()
      })
      .eq('id', selectedCompanyId);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      const planNames: Record<string, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' };
      toast({ 
        title: `${planNames[selectedPlan]} planı aktivləşdirildi!`, 
        description: selectedPlan !== 'free' ? 'Ödəniş sistemi tezliklə əlavə olunacaq.' : undefined
      });
      setConfirmDialogOpen(false);
      fetchUserCompanies();
    }
    
    setLoading(false);
  };

  const getCompanyCurrentPlan = () => {
    const company = userCompanies.find(c => c.id === selectedCompanyId);
    return company?.subscription_plan || 'free';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4">Qiymətləndirmə</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Biznesiniz üçün düzgün planı seçin
          </h1>
          <p className="text-xl text-muted-foreground">
            Hər ölçüdə şirkət üçün şəffaf qiymətləndirmə. İstənilən vaxt plan dəyişdirmək mümkündür.
          </p>
        </div>

        {/* User's Companies Info */}
        {user && userCompanies.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Şirkətinizin hazırkı planı</span>
                </div>
                {userCompanies.length === 1 ? (
                  <div className="flex items-center justify-between">
                    <span>{userCompanies[0].name}</span>
                    <Badge variant="outline">{userCompanies[0].subscription_plan?.toUpperCase() || 'FREE'}</Badge>
                  </div>
                ) : (
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şirkət seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {userCompanies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.subscription_plan?.toUpperCase() || 'FREE'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => {
            const isCurrentPlan = selectedCompanyId && getCompanyCurrentPlan() === plan.id;
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105 z-10' 
                    : isCurrentPlan
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Ən populyar
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      <Check className="h-3 w-3 mr-1" />
                      Hazırkı
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.popular ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full mt-6"
                    variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Hazırkı plan' : plan.id === 'free' ? 'Başla' : 'Plan seç'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Bütün planlara daxil olan xüsusiyyətlər</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">SSL Təhlükəsizliyi</h3>
              <p className="text-sm text-muted-foreground">Bütün məlumatlar şifrələnir</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-vaxt Statistika</h3>
              <p className="text-sm text-muted-foreground">Canlı reytinq yeniləmələri</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">İstifadəçi Dəstəyi</h3>
              <p className="text-sm text-muted-foreground">7/24 texniki dəstək</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Tez-tez Verilən Suallar</h2>
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Planı istənilən vaxt dəyişdirə bilərəm?</h3>
              <p className="text-muted-foreground text-sm">
                Bəli, planınızı istənilən vaxt yüksəldə və ya aşağı sala bilərsiniz. Dəyişikliklər dərhal qüvvəyə minir.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Geri ödəmə siyasətiniz necədir?</h3>
              <p className="text-muted-foreground text-sm">
                İlk 14 gün ərzində tam geri ödəmə təmin edirik. Heç bir sual verilmədən.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Çoxlu şirkətim varsa necə?</h3>
              <p className="text-muted-foreground text-sm">
                Enterprise planında çoxlu şirkət idarəetməsi mövcuddur. Hər şirkət üçün ayrıca dashboard və analitika əldə edə bilərsiniz.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan Dəyişikliyi</DialogTitle>
            <DialogDescription>
              {selectedPlan && `${plans.find(p => p.id === selectedPlan)?.name} planını seçmək istədiyinizə əminsiniz?`}
            </DialogDescription>
          </DialogHeader>

          {userCompanies.length > 1 && (
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Şirkət seçin:</label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Şirkət seçin" />
                </SelectTrigger>
                <SelectContent>
                  {userCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleConfirmPlan} disabled={loading || !selectedCompanyId}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Təsdiq et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PricingPage;
