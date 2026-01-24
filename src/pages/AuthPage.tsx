import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, EyeOff, Mail, Lock, User, Phone, Bot, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, signIn, signUp, loading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('phone');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 9 digits (excluding country code)
    return digits.slice(0, 9);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Xəta",
        description: "Bütün sahələri doldurun",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    setIsLoading(false);
    
    if (error) {
      let errorMessage = "Daxil olma zamanı xəta baş verdi";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email və ya şifrə yanlışdır";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email təsdiqlənməyib";
      }
      
      toast({
        title: "Xəta",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Uğurlu!",
      description: "Hesabınıza daxil oldunuz",
    });
    navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerPassword) {
      toast({
        title: "Xəta",
        description: "Ad və şifrə sahələrini doldurun",
        variant: "destructive",
      });
      return;
    }

    if (registerMethod === 'email' && !registerEmail) {
      toast({
        title: "Xəta",
        description: "Email sahəsini doldurun",
        variant: "destructive",
      });
      return;
    }

    if (registerMethod === 'phone' && registerPhone.length !== 9) {
      toast({
        title: "Xəta",
        description: "Telefon nömrəsi 9 rəqəmdən ibarət olmalıdır",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Xəta",
        description: "Şifrə ən azı 6 simvoldan ibarət olmalıdır",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // For phone registration, create an email from phone number
    const email = registerMethod === 'phone' 
      ? `+994${registerPhone}@phone.ratings.az`
      : registerEmail;
    
    const { error } = await signUp(email, registerPassword, registerName);
    
    setIsLoading(false);
    
    if (error) {
      let errorMessage = "Qeydiyyat zamanı xəta baş verdi";
      
      if (error.message.includes("User already registered")) {
        errorMessage = registerMethod === 'phone' 
          ? "Bu telefon nömrəsi artıq qeydiyyatdan keçib"
          : "Bu email artıq qeydiyyatdan keçib";
      } else if (error.message.includes("Password")) {
        errorMessage = "Şifrə tələblərə uyğun deyil";
      }
      
      toast({
        title: "Xəta",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Uğurlu qeydiyyat!",
      description: "Hesabınız yaradıldı. Avtomatik daxil oldunuz.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("compare.backToSearch")}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">
                ratings.az
              </span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">AI ilə qorunan platform</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>AI rəy doğrulaması</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Spam qoruması</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Saxta rəy aşkarlama</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Güvən balı sistemi</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t("nav.login")}</CardTitle>
              <CardDescription>
                Hesabınıza daxil olun və ya qeydiyyatdan keçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Daxil ol</TabsTrigger>
                  <TabsTrigger value="register">Qeydiyyat</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email və ya Telefon</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="text"
                          placeholder="email@example.com və ya +994xxxxxxxxx"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Şifrə</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                      {isLoading ? "Yüklənir..." : "Daxil ol"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  {/* Registration method selector */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={registerMethod === 'phone' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setRegisterMethod('phone')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Telefon
                    </Button>
                    <Button
                      type="button"
                      variant={registerMethod === 'email' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setRegisterMethod('email')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Ad Soyad</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Ad Soyad"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {registerMethod === 'phone' ? (
                      <div className="space-y-2">
                        <Label htmlFor="register-phone">Telefon nömrəsi</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <div className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm border-r pr-2">
                            +994
                          </div>
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="XX XXX XX XX"
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(formatPhoneNumber(e.target.value))}
                            className="pl-[4.5rem]"
                            maxLength={9}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Nümunə: 50 123 45 67</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="email@example.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Şifrə</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 6 simvol"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                      {isLoading ? "Yüklənir..." : "Qeydiyyatdan keç"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
