import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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
  Loader2,
  CreditCard,
  Lock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
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

type PaymentStep = 'select' | 'details' | 'processing' | 'success';

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Payment flow states
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

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
      priceValue: 0,
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
      priceValue: 49,
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
      priceValue: 149,
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
    setPaymentStep(planId === 'free' ? 'select' : 'details');
    setConfirmDialogOpen(true);
    // Reset payment form
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setProcessingProgress(0);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    if (selectedPlan !== 'free') {
      // Validate card details
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast({ title: 'Kart nömrəsi səhvdir', variant: 'destructive' });
        return;
      }
      if (!cardName.trim()) {
        toast({ title: 'Kart sahibinin adını daxil edin', variant: 'destructive' });
        return;
      }
      if (cardExpiry.length < 5) {
        toast({ title: 'Bitmə tarixini daxil edin', variant: 'destructive' });
        return;
      }
      if (cardCvv.length < 3) {
        toast({ title: 'CVV daxil edin', variant: 'destructive' });
        return;
      }
    }

    // Start processing animation
    setPaymentStep('processing');
    setProcessingProgress(0);
    
    // Simulate payment processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Actually update the plan
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
      setPaymentStep('details');
      toast({ title: 'Ödəniş xətası', description: 'Zəhmət olmasa yenidən cəhd edin', variant: 'destructive' });
    } else {
      setPaymentStep('success');
      fetchUserCompanies();
    }
  };

  const handleConfirmFreePlan = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('companies')
      .update({ 
        subscription_plan: 'free',
        subscription_expires_at: null
      })
      .eq('id', selectedCompanyId);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: 'Free planı aktivləşdirildi!' });
      setConfirmDialogOpen(false);
      fetchUserCompanies();
    }
    
    setLoading(false);
  };

  const handleDialogClose = () => {
    setConfirmDialogOpen(false);
    setPaymentStep('select');
    setSelectedPlan(null);
  };

  const getCompanyCurrentPlan = () => {
    const company = userCompanies.find(c => c.id === selectedCompanyId);
    return company?.subscription_plan || 'free';
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

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

      {/* Payment Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          {/* Free Plan Confirmation */}
          {selectedPlan === 'free' && paymentStep === 'select' && (
            <>
              <DialogHeader>
                <DialogTitle>Free Planı Seçin</DialogTitle>
                <DialogDescription>
                  Free planına keçmək istədiyinizə əminsiniz?
                </DialogDescription>
              </DialogHeader>

              {userCompanies.length > 1 && (
                <div className="py-4">
                  <Label className="mb-2 block">Şirkət seçin:</Label>
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
                <Button variant="outline" onClick={handleDialogClose}>
                  Ləğv et
                </Button>
                <Button onClick={handleConfirmFreePlan} disabled={loading || !selectedCompanyId}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Təsdiq et
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Payment Details Step */}
          {selectedPlan !== 'free' && paymentStep === 'details' && selectedPlanData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Ödəniş Məlumatları
                </DialogTitle>
                <DialogDescription>
                  {selectedPlanData.name} planı - {selectedPlanData.price}/ay
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Company selector for multiple companies */}
                {userCompanies.length > 1 && (
                  <div>
                    <Label className="mb-2 block">Şirkət</Label>
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

                {/* Card Number */}
                <div>
                  <Label htmlFor="cardNumber">Kart nömrəsi</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="pl-10"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Card Name */}
                <div>
                  <Label htmlFor="cardName">Kart sahibinin adı</Label>
                  <Input
                    id="cardName"
                    placeholder="AD SOYAD"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Bitmə tarixi</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <div className="relative">
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        type="password"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Security notice */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Ödəniş məlumatlarınız 256-bit SSL ilə şifrələnir</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  Ləğv et
                </Button>
                <Button onClick={handlePayment} disabled={!selectedCompanyId}>
                  <Lock className="h-4 w-4 mr-2" />
                  {selectedPlanData.price} Ödə
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Processing Step */}
          {paymentStep === 'processing' && (
            <div className="py-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" 
                />
                <CreditCard className="absolute inset-0 m-auto h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Ödəniş emal edilir...</h3>
              <p className="text-muted-foreground text-sm mb-4">Zəhmət olmasa gözləyin</p>
              <Progress value={processingProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">{processingProgress}%</p>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === 'success' && selectedPlanData && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Ödəniş Uğurlu!</h3>
              <p className="text-muted-foreground mb-6">
                {selectedPlanData.name} planı aktivləşdirildi
              </p>
              
              <div className="bg-muted p-4 rounded-lg mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{selectedPlanData.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Məbləğ:</span>
                  <span className="font-medium">{selectedPlanData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Növbəti ödəniş:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('az-AZ')}
                  </span>
                </div>
              </div>

              <Button onClick={() => navigate(`/business-dashboard/${selectedCompanyId}`)} className="w-full">
                Dashboard-a Keç
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PricingPage;