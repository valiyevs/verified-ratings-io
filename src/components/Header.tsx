import { Button } from "@/components/ui/button";
import { Shield, Menu, X, LogOut, User, Settings, Building2, BarChart3, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut, loading } = useAuth();
  const { isModerator } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
            <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.surveys")}
            </Link>
            <Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t("nav.compare")}
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Qiymətlər
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <User className="w-4 h-4" />
                        <span className="max-w-[120px] truncate">
                          {user.user_metadata?.full_name || user.email?.split("@")[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-muted-foreground text-sm">
                        {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profilim
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/my-companies')} className="cursor-pointer">
                        <Building2 className="w-4 h-4 mr-2" />
                        Şirkətlərim
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/add-company')} className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Şirkət əlavə et
                      </DropdownMenuItem>
                      {isModerator && (
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Çıxış
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button variant="ghost">{t("nav.login")}</Button>
                  </Link>
                )}
              </>
            )}
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
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Dashboard
              </Link>
              <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.surveys")}
              </Link>
              <Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                {t("nav.compare")}
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Qiymətlər
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="px-2 py-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4 inline mr-2" />
                          {user.user_metadata?.full_name || user.email}
                        </div>
                        <Link to="/profile">
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="w-4 h-4 mr-2" />
                            Profilim
                          </Button>
                        </Link>
                        <Link to="/add-company">
                          <Button variant="ghost" className="w-full justify-start">
                            <Building2 className="w-4 h-4 mr-2" />
                            Şirkət əlavə et
                          </Button>
                        </Link>
                        {isModerator && (
                          <Link to="/admin">
                            <Button variant="ghost" className="w-full justify-start">
                              <Settings className="w-4 h-4 mr-2" />
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        <Button variant="outline" className="w-full" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Çıxış
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth">
                        <Button variant="outline" className="w-full">{t("nav.login")}</Button>
                      </Link>
                    )}
                  </>
                )}
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
