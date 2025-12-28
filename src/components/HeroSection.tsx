import { Button } from "@/components/ui/button";
import { Search, Shield, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  const stats = [
    { icon: Users, value: "50,000+", label: "Aktiv istifadəçi" },
    { icon: Shield, value: "2,500+", label: "Doğrulanmış şirkət" },
    { icon: TrendingUp, value: "150,000+", label: "Real rəy" },
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-trust-light text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
            <Shield className="w-4 h-4" />
            SİMA ilə doğrulanmış rəylər
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-gradient">ratings.az</span>{" "}
            <span className="block text-2xl md:text-3xl lg:text-4xl mt-2 font-normal text-muted-foreground">Azərbaycanın Şəffaf Reytinq Platforması</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Real istifadəçi rəylərinə əsaslanan etibarlı şirkət reytinqləri. 
            Saxta rəylərə son, şəffaflığa başlanğıc.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Şirkət adı, kateqoriya və ya xidmət axtarın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-36 bg-card border-2 border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-card"
              />
              <Button variant="hero" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleSearch}>
                Axtar
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <span>Populyar:</span>
              {["Banklar", "Sığorta", "Telekommunikasiya", "E-ticarət"].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-secondary hover:bg-muted rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 bg-trust-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
