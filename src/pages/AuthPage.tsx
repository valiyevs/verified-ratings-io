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
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, signIn, signUp, loading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 9);
  };

  const isPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 9 && /^\d+$/.test(digits);
  };

  const resolveEmailFromPhone = async (phone: string): Promise<string | null> => {
    const digits = phone.replace(/\D/g, '');
    const normalizedPhone = digits.startsWith('994') ? digits : `994${digits}`;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('phone', normalizedPhone)
      .maybeSingle();
    
    if (error || !data?.email) return null;
    return data.email;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginIdentifier || !loginPassword) {
      toast({ title: "Xəta", description: "Bütün sahələri doldurun", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    let email = loginIdentifier.trim();
    
    // If user entered a phone number, look up the associated email
    if (isPhoneNumber(email)) {
      const resolvedEmail = await resolveEmailFromPhone(email);
      if (!resolvedEmail) {
        setIsLoading(false);
        toast({ title: "Xəta", description: "Bu telefon nömrəsi ilə qeydiyyatdan keçmiş hesab tapılmadı", variant: "destructive" });
        return;
      }
      email = resolvedEmail;
    }
    
    const { error } = await signIn(email, loginPassword);
    setIsLoading(false);
    
    if (error) {
      let errorMessage = "Daxil olma zamanı xəta baş verdi";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email/telefon və ya şifrə yanlışdır";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email təsdiqlənməyib. Zəhmət olmasa emailinizi yoxlayın.";
      }
      toast({ title: "Xəta", description: errorMessage, variant: "destructive" });
      return;
    }

    toast({ title: "Uğurlu!", description: "Hesabınıza daxil oldunuz" });
    navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast({ title: "Xəta", description: "Ad, email və şifrə sahələrini doldurun", variant: "destructive" });
      return;
    }

    if (registerPhone && registerPhone.length !== 9) {
      toast({ title: "Xəta", description: "Telefon nömrəsi 9 rəqəmdən ibarət olmalıdır", variant: "destructive" });
      return;
    }

    if (registerPassword.length < 6) {
      toast({ title: "Xəta", description: "Şifrə ən azı 6 simvoldan ibarət olmalıdır", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(registerEmail.trim(), registerPassword, registerName.trim());
    
    if (error) {
      setIsLoading(false);
      let errorMessage = "Qeydiyyat zamanı xəta baş verdi";
      if (error.message.includes("User already registered")) {
        errorMessage = "Bu email artıq qeydiyyatdan keçib";
      } else if (error.message.includes("Password")) {
        errorMessage = "Şifrə tələblərə uyğun deyil";
      }
      toast({ title: "Xəta", description: errorMessage, variant: "destructive" });
      return;
    }

    // Save phone number to profile if provided
    if (registerPhone) {
      const normalizedPhone = `994${registerPhone}`;
      // We update profile after signup - the trigger creates the profile row
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase
          .from('profiles')
          .update({ phone: normalizedPhone })
          .eq('user_id', newUser.id);
      }
    }

    setIsLoading(false);

    toast({
      title: "Uğurlu qeydiyyat!",
      description: "Emailinizə təsdiq linki göndərildi. Zəhmət olmasa emailinizi yoxlayın.",
    });
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
      <header className="p-4">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("compare.backToSearch")}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">ratings.az</span>
            </Link>
          </div>

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
              <CardDescription>Hesabınıza daxil olun və ya qeydiyyatdan keçin</CardDescription>
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
                      <Label htmlFor="login-identifier">Email və ya Telefon</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-identifier"
                          type="text"
                          placeholder="email@example.com və ya 50XXXXXXX"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
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

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email *</Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Telefon nömrəsi (istəyə bağlı)</Label>
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
