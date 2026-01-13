import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, X, Send, Upload, Image } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  companyName: string;
  companyId: string;
  onClose: () => void;
  onSubmit: (data: { 
    title: string; 
    content: string; 
    rating: number;
    service_rating: number;
    price_rating: number;
    speed_rating: number;
    quality_rating: number;
    image_url?: string;
  }) => void;
}

const ReviewForm = ({ companyName, companyId, onClose, onSubmit }: ReviewFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [serviceRating, setServiceRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [speedRating, setSpeedRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  
  const [hoverServiceRating, setHoverServiceRating] = useState(0);
  const [hoverPriceRating, setHoverPriceRating] = useState(0);
  const [hoverSpeedRating, setHoverSpeedRating] = useState(0);
  const [hoverQualityRating, setHoverQualityRating] = useState(0);
  
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const averageRating = Math.round((serviceRating + priceRating + speedRating + qualityRating) / 4);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Şəkil 5MB-dan böyük ola bilməz', variant: 'destructive' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile || !user) return undefined;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('review-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('review-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (serviceRating === 0 || priceRating === 0 || speedRating === 0 || qualityRating === 0) {
      toast({ title: 'Bütün meyarları qiymətləndirin', variant: 'destructive' });
      return;
    }
    if (title.length < 3) {
      toast({ title: 'Başlıq ən azı 3 simvol olmalıdır', variant: 'destructive' });
      return;
    }
    if (reviewText.length < 20) {
      toast({ title: 'Rəy ən azı 20 simvol olmalıdır', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      onSubmit({ 
        title, 
        content: reviewText, 
        rating: averageRating,
        service_rating: serviceRating,
        price_rating: priceRating,
        speed_rating: speedRating,
        quality_rating: qualityRating,
        image_url: imageUrl
      });
    } catch (error) {
      toast({ title: 'Şəkil yüklənərkən xəta baş verdi', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const RatingInput = ({ 
    label, 
    value, 
    setValue, 
    hoverValue, 
    setHoverValue 
  }: { 
    label: string; 
    value: number; 
    setValue: (v: number) => void; 
    hoverValue: number; 
    setHoverValue: (v: number) => void; 
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-0.5 transition-transform hover:scale-110"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => setValue(star)}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= (hoverValue || value)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {companyName} haqqında rəy
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!user ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Rəy yazmaq üçün daxil olun</p>
          <Button onClick={() => navigate('/auth')}>Daxil ol</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Multi-criteria Ratings */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-medium text-foreground mb-3">
              Meyarlar üzrə qiymətləndirin
            </label>
            <RatingInput 
              label="Xidmət" 
              value={serviceRating} 
              setValue={setServiceRating}
              hoverValue={hoverServiceRating}
              setHoverValue={setHoverServiceRating}
            />
            <RatingInput 
              label="Qiymət" 
              value={priceRating} 
              setValue={setPriceRating}
              hoverValue={hoverPriceRating}
              setHoverValue={setHoverPriceRating}
            />
            <RatingInput 
              label="Sürət" 
              value={speedRating} 
              setValue={setSpeedRating}
              hoverValue={hoverSpeedRating}
              setHoverValue={setHoverSpeedRating}
            />
            <RatingInput 
              label="Keyfiyyət" 
              value={qualityRating} 
              setValue={setQualityRating}
              hoverValue={hoverQualityRating}
              setHoverValue={setHoverQualityRating}
            />
            
            {averageRating > 0 && (
              <div className="pt-2 border-t border-border mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Orta qiymət</span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-foreground">{averageRating.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Başlıq
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rəyinizin qısa xülasəsi"
              className="w-full"
            />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rəyinizi yazın
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Təcrübənizi ətraflı paylaşın. Bu digər istifadəçilərə kömək edəcək..."
              className="w-full h-32 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 20 simvol ({reviewText.length}/20)
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Qəbz/Şəkil əlavə edin (ixtiyari)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Şəkil yükləyin (maks. 5MB)</span>
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Ləğv et
            </Button>
            <Button 
              type="submit" 
              variant="hero" 
              className="flex-1"
              disabled={
                serviceRating === 0 || 
                priceRating === 0 || 
                speedRating === 0 || 
                qualityRating === 0 || 
                title.length < 3 || 
                reviewText.length < 20 ||
                uploading
              }
            >
              {uploading ? (
                <span>Yüklənir...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Göndər
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
