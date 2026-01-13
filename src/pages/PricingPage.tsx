import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Building2
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

const PricingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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
    setSelectedPlan(planId);
    if (planId === 'free') {
      toast({ 
        title: 'Free plan seçildi', 
        description: 'Hesabınız Free planda aktivdir.' 
      });
    } else {
      toast({ 
        title: 'Tezliklə aktiv olacaq', 
        description: 'Ödəniş sistemi tezliklə aktivləşdiriləcək.' 
      });
    }
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

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105 z-10' 
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
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.id === 'free' ? 'Başla' : 'Plan seç'}
                </Button>
              </CardContent>
            </Card>
          ))}
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
                Bəli, planınızı istənilən vaxt yüksəldə və ya aşağı sala bilərsiniz. Dəyişikliklər növbəti ödəniş dövrünüzdən etibarən qüvvəyə minir.
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

      <Footer />
    </div>
  );
};

export default PricingPage;
