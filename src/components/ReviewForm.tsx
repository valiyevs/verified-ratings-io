import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, X, Upload, Send } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  companyName: string;
  onClose: () => void;
}

const criteria = [
  { id: "service", label: "Xidmət keyfiyyəti" },
  { id: "price", label: "Qiymət/Dəyər" },
  { id: "speed", label: "Sürət" },
  { id: "support", label: "Müştəri dəstəyi" },
];

const ReviewForm = ({ companyName, onClose }: ReviewFormProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({
    service: 0,
    price: 0,
    speed: 0,
    support: 0,
  });
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState("");
  const [hasReceipt, setHasReceipt] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasAllRatings = Object.values(ratings).every(r => r > 0);
    if (!hasAllRatings) {
      toast.error("Zəhmət olmasa bütün meyarları qiymətləndirin");
      return;
    }
    if (reviewText.length < 20) {
      toast.error("Rəy mətni ən azı 20 simvol olmalıdır");
      return;
    }

    toast.success("Rəyiniz uğurla göndərildi! Təsdiq edildikdən sonra yayımlanacaq.");
    onClose();
  };

  const renderStars = (criteriaId: string) => {
    const currentRating = hoverRatings[criteriaId] || ratings[criteriaId];
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-transform hover:scale-110"
            onMouseEnter={() => setHoverRatings({ ...hoverRatings, [criteriaId]: star })}
            onMouseLeave={() => setHoverRatings({ ...hoverRatings, [criteriaId]: 0 })}
            onClick={() => setRatings({ ...ratings, [criteriaId]: star })}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= currentRating
                  ? "text-gold fill-gold"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating criteria */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-2">
            Hər meyar üzrə qiymət verin:
          </p>
          {criteria.map((criterion) => (
            <div key={criterion.id} className="flex items-center justify-between">
              <span className="text-foreground font-medium">{criterion.label}</span>
              {renderStars(criterion.id)}
            </div>
          ))}
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

        {/* Receipt upload */}
        <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-dashed border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Qəbz və ya şəkil əlavə edin</p>
            <p className="text-sm text-muted-foreground">Rəyinizin dürüstlüyünü təsdiqləyin</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="checkbox"
              checked={hasReceipt}
              onChange={(e) => setHasReceipt(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-7 rounded-full transition-colors ${hasReceipt ? 'bg-primary' : 'bg-border'} relative`}>
              <div className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow transition-all ${hasReceipt ? 'right-1' : 'left-1'}`} />
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Ləğv et
          </Button>
          <Button type="submit" variant="hero" className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Göndər
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Rəyiniz SİMA ilə doğrulanmış hesabınızla əlaqələndiriləcək
        </p>
      </form>
    </div>
  );
};

export default ReviewForm;
