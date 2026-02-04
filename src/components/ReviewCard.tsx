import { useState } from "react";
import StarRating from "./StarRating";
import { ThumbsUp, CheckCircle, ImageIcon, Star, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import AIVerificationBadge from "./AIVerificationBadge";
import ModeratorBadge from "./ModeratorBadge";
import ReviewHistoryModal from "./ReviewHistoryModal";

interface ReviewCardProps {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  title?: string;
  helpful: number;
  hasReceipt: boolean;
  imageUrl?: string;
  serviceRating?: number;
  priceRating?: number;
  speedRating?: number;
  qualityRating?: number;
  companyReply?: string;
  companyReplyAt?: string;
  isCompanyOwner?: boolean;
  onReplySubmit?: (reviewId: string, reply: string) => void;
  trustScore?: number;
  status?: string;
  hasHistory?: boolean;
}

const ReviewCard = ({ 
  id,
  author, 
  date, 
  rating, 
  text,
  title,
  helpful, 
  hasReceipt, 
  imageUrl,
  serviceRating,
  priceRating,
  speedRating,
  qualityRating,
  companyReply,
  companyReplyAt,
  isCompanyOwner,
  onReplySubmit,
  trustScore,
  status,
  hasHistory
}: ReviewCardProps) => {
  const { user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(helpful);
  const [isHelpful, setIsHelpful] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showCriteria, setShowCriteria] = useState(false);

  const handleHelpful = async () => {
    if (!user) {
      toast({ title: 'Daxil olun', description: 'Faydalı bilmək üçün hesaba daxil olun', variant: 'destructive' });
      return;
    }

    if (isHelpful) {
      // Remove helpful
      const { error } = await supabase
        .from('review_helpful')
        .delete()
        .eq('review_id', id)
        .eq('user_id', user.id);

      if (!error) {
        setHelpfulCount(prev => prev - 1);
        setIsHelpful(false);
      }
    } else {
      // Add helpful
      const { error } = await supabase
        .from('review_helpful')
        .insert({ review_id: id, user_id: user.id });

      if (!error) {
        setHelpfulCount(prev => prev + 1);
        setIsHelpful(true);
        toast({ title: 'Faydalı olaraq qeyd edildi' });
      }
    }
  };

  const handleReplySubmit = () => {
    if (replyText.length < 10) {
      toast({ title: 'Cavab ən azı 10 simvol olmalıdır', variant: 'destructive' });
      return;
    }
    onReplySubmit?.(id, replyText);
    setShowReplyForm(false);
    setReplyText("");
  };

  const CriteriaRow = ({ label, value }: { label: string; value?: number }) => (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= (value || 0) ? "text-yellow-400 fill-yellow-400" : "text-border"
            }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-trust-dark rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg">
            {author.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{author}</span>
              <CheckCircle className="w-4 h-4 text-primary" />
              {/* AI Verification Badge */}
              {status === 'approved' && (
                <AIVerificationBadge 
                  status="verified" 
                  score={trustScore ? Math.round(trustScore * 100) : 85} 
                  compact 
                />
              )}
              {/* Moderator Badge */}
              {status === 'approved' && <ModeratorBadge compact />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{date}</span>
              {/* Review History */}
              {hasHistory && title && (
                <ReviewHistoryModal 
                  reviewId={id}
                  currentTitle={title}
                  currentContent={text}
                  currentRating={rating}
                />
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={rating} size="sm" showValue={false} />
          {(serviceRating || priceRating || speedRating || qualityRating) && (
            <button
              onClick={() => setShowCriteria(!showCriteria)}
              className="text-xs text-primary flex items-center gap-1 mt-1 ml-auto"
            >
              Ətraflı {showCriteria ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Criteria breakdown */}
      {showCriteria && (serviceRating || priceRating || speedRating || qualityRating) && (
        <div className="bg-secondary/50 rounded-lg p-3 mb-4 space-y-2">
          <CriteriaRow label="Xidmət" value={serviceRating} />
          <CriteriaRow label="Qiymət" value={priceRating} />
          <CriteriaRow label="Sürət" value={speedRating} />
          <CriteriaRow label="Keyfiyyət" value={qualityRating} />
        </div>
      )}

      <p className="text-foreground mb-4 leading-relaxed">{text}</p>

      {/* Image */}
      {imageUrl && (
        <div className="mb-4">
          <button
            onClick={() => setShowImage(!showImage)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ImageIcon className="w-4 h-4" />
            {showImage ? 'Şəkli gizlət' : 'Qəbzi/şəkli göstər'}
          </button>
          {showImage && (
            <img 
              src={imageUrl} 
              alt="Review attachment" 
              className="mt-2 max-w-full max-h-64 rounded-lg border border-border"
            />
          )}
        </div>
      )}

      {/* Company Reply */}
      {companyReply && (
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Şirkət cavabı</span>
            {companyReplyAt && (
              <span className="text-xs text-muted-foreground">
                • {new Date(companyReplyAt).toLocaleDateString('az-AZ')}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground">{companyReply}</p>
        </div>
      )}

      {/* Reply Form for Company Owner */}
      {isCompanyOwner && !companyReply && (
        <div className="mb-4">
          {showReplyForm ? (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Rəyə cavab yazın..."
                className="w-full h-20 px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
                  Ləğv et
                </Button>
                <Button size="sm" onClick={handleReplySubmit}>
                  Cavab göndər
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowReplyForm(true)}
              className="text-primary"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Cavab yaz
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          {(hasReceipt || imageUrl) && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <ImageIcon className="w-4 h-4" />
              <span>Qəbz əlavə edilib</span>
            </div>
          )}
        </div>
        <button 
          onClick={handleHelpful}
          className={`flex items-center gap-2 transition-colors ${
            isHelpful ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-primary' : ''}`} />
          <span className="text-sm">Faydalı ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
