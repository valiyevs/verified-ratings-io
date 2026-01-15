import { Button } from "@/components/ui/button";
import { Search, Shield, Users, TrendingUp, Star, CheckCircle, Award } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import heroIllustration from "@/assets/hero-illustration.png";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = () => {
    navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  const stats = [
    { icon: Users, value: "50,000+", label: t("hero.stats.users"), color: "from-blue-500 to-cyan-500" },
    { icon: Shield, value: "2,500+", label: t("hero.stats.companies"), color: "from-emerald-500 to-teal-500" },
    { icon: TrendingUp, value: "150,000+", label: t("hero.stats.reviews"), color: "from-violet-500 to-purple-500" },
  ];

  const trustBadges = [
    { icon: CheckCircle, text: "FIN Doğrulaması" },
    { icon: Shield, text: "Təhlükəsiz Platform" },
    { icon: Award, text: "Şəffaf Reytinq" },
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        {/* Floating elements */}
        <div className="absolute top-32 right-20 opacity-20">
          <Star className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDuration: "3s" }} />
        </div>
        <div className="absolute bottom-40 left-20 opacity-20">
          <Shield className="w-10 h-10 text-primary animate-bounce" style={{ animationDuration: "4s" }} />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up border border-primary/20">
              <Shield className="w-4 h-4" />
              {t("hero.badge")}
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span className="text-gradient">{t("hero.title")}</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl mt-3 font-normal text-muted-foreground">{t("hero.subtitle")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {t("hero.description")}
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.25s" }}>
              {trustBadges.map((badge, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  {badge.text}
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full h-14 pl-14 pr-36 bg-card border-2 border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-lg"
                />
                <Button variant="hero" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleSearch}>
                  {t("hero.search")}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-muted-foreground">
                <span>{t("hero.popular")}</span>
                {["Banklar", "Sığorta", "Telekommunikasiya", "E-ticarət"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?category=${encodeURIComponent(tag)}`)}
                    className="px-3 py-1 bg-secondary hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right content - Hero Image */}
          <div className="relative animate-fade-up lg:block hidden" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              {/* Decorative elements behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Main image */}
              <img 
                src={heroIllustration} 
                alt="Platform illustration" 
                className="relative rounded-2xl shadow-2xl w-full"
              />
              
              {/* Floating stat cards */}
              <div className="absolute -left-8 top-1/4 bg-card rounded-xl p-4 shadow-lg border border-border/50 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-xs text-muted-foreground">Orta reytinq</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-card rounded-xl p-4 shadow-lg border border-border/50 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-xs text-muted-foreground">Təsdiqlənmiş</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-up" style={{ animationDelay: "0.5s" }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border/50"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1 text-center">{stat.value}</div>
              <div className="text-muted-foreground text-center">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;