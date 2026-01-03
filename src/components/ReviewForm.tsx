import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ReviewFormProps {
  companyName: string;
  companyId: string;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; rating: number }) => void;
}

const ReviewForm = ({ companyName, companyId, onClose, onSubmit }: ReviewFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (rating === 0) {
      return;
    }
    if (title.length < 3) {
      return;
    }
    if (reviewText.length < 20) {
      return;
    }

    onSubmit({ title, content: reviewText, rating });
  };

  const currentRating = hoverRating || rating;

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
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ümumi qiymət
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= currentRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
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

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Ləğv et
            </Button>
            <Button 
              type="submit" 
              variant="hero" 
              className="flex-1"
              disabled={rating === 0 || title.length < 3 || reviewText.length < 20}
            >
              <Send className="w-4 h-4 mr-2" />
              Göndər
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
