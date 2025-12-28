import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquareText, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
const features = [
  {
    icon: MessageSquareText,
    title: "Rəsmi Cavab Hüququ",
    description: "Müştəri rəylərinə rəsmi şəkildə cavab verin",
  },
  {
    icon: BarChart3,
    title: "Dərin Analitika",
    description: "Müştəri məmnuniyyəti trendlərini izləyin",
  },
  {
    icon: Users,
    title: "Bazar Araşdırması",
    description: "Hədəf auditoriyaya sorğular göndərin",
  },
  {
    icon: TrendingUp,
    title: "Rəqib Analizi",
    description: "Sektorunuzdakı mövqeyinizi öyrənin",
  },
];

const BusinessCTA = () => {
  const { t } = useLanguage();

  return (
    <section id="business" className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-border overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <BarChart3 className="w-4 h-4" />
                  {t("nav.forBusiness")}
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {t("business.title")}
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  {t("business.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/surveys/create">
                    <Button variant="hero" size="lg">
                      {t("business.cta")}
                    </Button>
                  </Link>
                  <a href="mailto:info@ratings.az">
                    <Button variant="outline" size="lg">
                      Demo İstə
                    </Button>
                  </a>
                </div>
              </div>

              {/* Right content - Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="bg-background/50 backdrop-blur-sm rounded-xl p-5 border border-border animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
