import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              ratings.az
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.companies")}
            </Link>
            <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.categories")}
            </a>
            <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.surveys")}
            </Link>
            <Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.compare")}
            </Link>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.howItWorks")}
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="ghost">{t("nav.login")}</Button>
            </Link>
            <Link to="/search">
              <Button variant="hero">{t("nav.writeReview")}</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <nav className="flex flex-col gap-4">
              <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.companies")}
              </Link>
              <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.categories")}
              </a>
              <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.surveys")}
              </Link>
              <Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.compare")}
              </Link>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.howItWorks")}
              </a>
              <a href="#business" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.forBusiness")}
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link to="/auth">
                  <Button variant="outline" className="w-full">{t("nav.login")}</Button>
                </Link>
                <Link to="/search">
                  <Button variant="hero" className="w-full">{t("nav.writeReview")}</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
