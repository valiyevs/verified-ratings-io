import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categories = [
  "Banklar",
  "Telekommunikasiya",
  "E-ticarət",
  "Sığorta",
  "Retail",
  "Nəqliyyat",
  "Kommunal",
  "Səhiyyə",
  "Təhsil",
  "Restoran",
  "Otel",
  "Digər"
];

const AddCompanyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    logo_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Xəta",
        description: "Şirkət əlavə etmək üçün daxil olmalısınız",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!formData.name || !formData.category) {
      toast({
        title: "Xəta",
        description: "Şirkət adı və kateqoriya mütləqdir",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.from("companies").insert({
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        website: formData.website.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        logo_url: formData.logo_url.trim() || null,
        owner_id: user.id,
        status: "pending"
      });

      if (error) throw error;

      toast({
        title: "Uğurlu!",
        description: "Şirkət əlavə edildi. Moderator təsdiqindən sonra siyahıda görünəcək."
      });
      
      navigate("/profile");
    } catch (error: any) {
      console.error("Error adding company:", error);
      toast({
        title: "Xəta",
        description: error.message || "Şirkət əlavə edilərkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-display text-2xl font-bold mb-4">Daxil olmalısınız</h1>
            <p className="text-muted-foreground mb-6">
              Şirkət əlavə etmək üçün hesabınıza daxil olun
            </p>
            <Button onClick={() => navigate("/auth")}>
              Daxil ol
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Yeni şirkət əlavə et</CardTitle>
              <CardDescription>
                Şirkətinizi platformamıza əlavə edin. Moderator təsdiqindən sonra siyahıda görünəcək.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Şirkət adı *</Label>
                    <Input
                      id="name"
                      placeholder="Şirkət adını daxil edin"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kateqoriya *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kateqoriya seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Təsvir</Label>
                    <Textarea
                      id="description"
                      placeholder="Şirkət haqqında qısa məlumat"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground">Əlaqə məlumatları</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Veb sayt</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-poçt</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="info@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+994 XX XXX XX XX"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={formData.logo_url}
                        onChange={(e) => handleChange("logo_url", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Ünvan</Label>
                    <Input
                      id="address"
                      placeholder="Bakı, Azərbaycan"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Ləğv et
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Göndərilir...
                      </>
                    ) : (
                      "Şirkət əlavə et"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddCompanyPage;
