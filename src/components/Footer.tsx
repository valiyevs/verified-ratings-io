import { Shield, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-navy text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">ratings.az</span>
            </div>
            <p className="text-primary-foreground/60 mb-6">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.platform")}</h4>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("nav.companies")}</Link></li>
              <li><Link to="/#categories" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("nav.categories")}</Link></li>
              <li><Link to="/search" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.latestReviews")}</Link></li>
              <li><Link to="/compare" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("nav.compare")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.forCompanies")}</h4>
            <ul className="space-y-3">
              <li><Link to="/#business" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.registration")}</Link></li>
              <li><Link to="/#business" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.pricing")}</Link></li>
              <li><Link to="/surveys" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.analytics")}</Link></li>
              <li><Link to="/#business" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.api")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.support")}</h4>
            <ul className="space-y-3">
              <li><Link to="/#how-it-works" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.about")}</Link></li>
              <li><a href="mailto:info@ratings.az" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.contact")}</a></li>
              <li><Link to="/#how-it-works" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.faq")}</Link></li>
              <li><Link to="/" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">{t("footer.privacy")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-sm">
            © 2024 ratings.az. {t("footer.rights")}
          </p>
          <p className="text-primary-foreground/40 text-sm">
            {t("footer.aiIntegration")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
