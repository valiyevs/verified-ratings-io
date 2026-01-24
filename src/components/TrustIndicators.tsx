import { Shield, Bot, Users, CheckCircle, Lock, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TrustIndicators = () => {
  const indicators = [
    {
      icon: Bot,
      title: "AI Doğrulama",
      description: "Hər rəy süni intellekt tərəfindən orijinallıq üçün analiz edilir",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Spam Qoruması",
      description: "Avtomatik spam və saxta rəy aşkarlama sistemi",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Real İstifadəçilər",
      description: "Telefon nömrəsi ilə doğrulanmış hesablar",
      color: "text-blue-500"
    },
    {
      icon: CheckCircle,
      title: "Yoxlanmış Rəylər",
      description: "Moderatorlar tərəfindən nəzərdən keçirilmiş məzmun",
      color: "text-yellow-500"
    },
    {
      icon: Lock,
      title: "12 Aylıq Limit",
      description: "Hər istifadəçi şirkət üçün ildə 1 rəy yaza bilər",
      color: "text-purple-500"
    },
    {
      icon: Award,
      title: "Güvən Balı",
      description: "İstifadəçi aktivliyinə əsaslanan güvən reytinqi",
      color: "text-orange-500"
    }
  ];

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Niyə Bizə Güvənməlisiniz?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Platformamız müasir texnologiyalar vasitəsilə rəylərin doğruluğunu təmin edir
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-secondary ${indicator.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {indicator.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {indicator.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
