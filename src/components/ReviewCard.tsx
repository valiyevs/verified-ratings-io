import StarRating from "./StarRating";
import { ThumbsUp, CheckCircle, ImageIcon } from "lucide-react";

interface ReviewCardProps {
  author: string;
  date: string;
  rating: number;
  text: string;
  helpful: number;
  hasReceipt: boolean;
}

const ReviewCard = ({ author, date, rating, text, helpful, hasReceipt }: ReviewCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-trust-dark rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg">
            {author.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{author}</span>
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
        </div>
        <StarRating rating={rating} size="sm" showValue={false} />
      </div>

      <p className="text-foreground mb-4 leading-relaxed">{text}</p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          {hasReceipt && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <ImageIcon className="w-4 h-4" />
              <span>Qəbz əlavə edilib</span>
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">Faydalı ({helpful})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
