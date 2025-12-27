import { Shield, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
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
              <span className="font-display text-xl font-bold">Şəffaf Reytinq</span>
            </div>
            <p className="text-primary-foreground/60 mb-6">
              Azərbaycanın ilk real istifadəçi rəylərinə əsaslanan şirkət reytinq platforması.
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
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Şirkətlər</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Kateqoriyalar</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Son Rəylər</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Müqayisə</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Şirkətlər üçün</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Qeydiyyat</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Qiymətləndirmə</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Analitika</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Dəstək</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Haqqımızda</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Əlaqə</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Tez-tez verilən suallar</a></li>
              <li><a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Gizlilik Siyasəti</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-sm">
            © 2024 Şəffaf Reytinq. Bütün hüquqlar qorunur.
          </p>
          <p className="text-primary-foreground/40 text-sm">
            SİMA inteqrasiyası ilə təhlükəsiz giriş
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
