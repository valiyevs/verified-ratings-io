import CompanyCard from "./CompanyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const companies = [
  {
    name: "Kapital Bank",
    category: "Bank",
    logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&h=100&fit=crop",
    rating: 4.5,
    reviewCount: 3245,
    trend: "up" as const,
    verified: true,
    topReview: "Müştəri xidməti çox yaxşılaşıb, mobil tətbiq əla işləyir.",
  },
  {
    name: "Azercell",
    category: "Telekommunikasiya",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop",
    rating: 4.2,
    reviewCount: 5678,
    trend: "stable" as const,
    verified: true,
    topReview: "İnternet sürəti stabil, amma qiymətlər bir az yüksəkdir.",
  },
  {
    name: "Bravo",
    category: "Retail",
    logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=100&h=100&fit=crop",
    rating: 4.0,
    reviewCount: 2134,
    trend: "up" as const,
    verified: true,
    topReview: "Məhsul çeşidi geniş, işçilər yardımseverdir.",
  },
  {
    name: "PASHA Sığorta",
    category: "Sığorta",
    logo: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=100&fit=crop",
    rating: 4.3,
    reviewCount: 1892,
    trend: "up" as const,
    verified: true,
    topReview: "Ödəniş prosesi çox sürətlidir, məsləhətçilər peşəkardır.",
  },
  {
    name: "Bolt",
    category: "Nəqliyyat",
    logo: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&h=100&fit=crop",
    rating: 4.6,
    reviewCount: 8934,
    trend: "up" as const,
    verified: true,
    topReview: "Qiymətlər münasib, sürücülər nəzakətlidir.",
  },
  {
    name: "Wolt",
    category: "E-ticarət",
    logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop",
    rating: 4.4,
    reviewCount: 6721,
    trend: "stable" as const,
    verified: true,
    topReview: "Çatdırılma sürəti əla, lakin bəzi restoranlar gecikmə edir.",
  },
];

const FeaturedCompanies = () => {
  return (
    <section id="companies" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Ən Yüksək Reytinqli Şirkətlər
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Real istifadəçi rəylərinə əsasən ən yüksək qiymətləndirilən şirkətlər
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto">
            Hamısına bax
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CompanyCard {...company} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;
