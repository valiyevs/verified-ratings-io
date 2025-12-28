import { Link } from "react-router-dom";
import { Clock, Gift, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Survey {
  id: string;
  companyName: string;
  companyLogo: string;
  title: string;
  reward?: string;
  expiresAt: string;
  responseCount: number;
}

const featuredSurveys: Survey[] = [
  {
    id: "survey-1",
    companyName: "Kapital Bank",
    companyLogo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop",
    title: "Mobil Tətbiq Təcrübəsi Sorğusu",
    reward: "10 AZN bonus",
    expiresAt: "2025-01-15",
    responseCount: 234
  },
  {
    id: "survey-2",
    companyName: "Azercell",
    companyLogo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop",
    title: "5G Xidməti Maraq Sorğusu",
    reward: "1 GB internet",
    expiresAt: "2025-01-20",
    responseCount: 567
  },
  {
    id: "survey-3",
    companyName: "Bravo",
    companyLogo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop",
    title: "Alış-veriş Vərdişləri Araşdırması",
    expiresAt: "2025-01-10",
    responseCount: 89
  }
];

const FeaturedSurveys = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {t("surveys.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("surveys.subtitle")}
            </p>
          </div>
          <Link to="/surveys">
            <Button variant="outline" className="gap-2">
              {t("surveys.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredSurveys.map((survey) => {
            const daysLeft = Math.ceil(
              (new Date(survey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Link key={survey.id} to={`/surveys/${survey.id}`}>
                <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={survey.companyLogo}
                        alt={survey.companyName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm text-muted-foreground">{survey.companyName}</p>
                        <h3 className="font-semibold text-foreground">{survey.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{daysLeft > 0 ? `${daysLeft} ${t("surveys.daysLeft")}` : t("surveys.expiring")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{survey.responseCount}</span>
                      </div>
                    </div>

                    {survey.reward && (
                      <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                        <Gift className="w-3 h-3 mr-1" />
                        {survey.reward}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSurveys;
