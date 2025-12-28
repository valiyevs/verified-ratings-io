import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Şəffaf Reytinq
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Şirkətlər
            </Link>
            <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Kateqoriyalar
            </a>
            <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Sorğular
            </Link>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Necə işləyir?
            </a>
            <a href="#business" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Biznes üçün
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">Daxil ol</Button>
            <Button variant="hero">Rəy yaz</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <nav className="flex flex-col gap-4">
              <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Şirkətlər
              </Link>
              <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Kateqoriyalar
              </a>
              <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Sorğular
              </Link>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Necə işləyir?
              </a>
              <a href="#business" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Biznes üçün
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" className="w-full">Daxil ol</Button>
                <Button variant="hero" className="w-full">Rəy yaz</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
