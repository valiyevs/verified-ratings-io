import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { MessageSquare, TrendingUp, CheckCircle, Scale } from "lucide-react";

interface CompanyCardProps {
  id: string;
  name: string;
  category: string;
  logo: string;
  rating: number;
  reviewCount: number;
  trend: "up" | "down" | "stable";
  verified: boolean;
  topReview?: string;
  onCompare?: (id: string) => void;
  isInCompare?: boolean;
}

const CompanyCard = ({
  id,
  name,
  category,
  logo,
  rating,
  reviewCount,
  trend,
  verified,
  topReview,
  onCompare,
  isInCompare = false,
}: CompanyCardProps) => {
  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompare?.(id);
  };

  return (
    <Link to={`/company/${id}`} className="block">
      <div className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border/50 cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={logo} alt={name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">{name}</h3>
              {verified && (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>

          {/* Compare Button */}
          {onCompare && (
            <Button
              variant={isInCompare ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={handleCompareClick}
            >
              <Scale className="w-4 h-4 mr-1" />
              {isInCompare ? "Seçildi" : "Müqayisə"}
            </Button>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={rating} />
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>{reviewCount} rəy</span>
          </div>
        </div>

        {/* Trend indicator */}
        {trend === "up" && (
          <div className="flex items-center gap-1 text-sm text-primary mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Bu ay reytinq artıb</span>
          </div>
        )}

        {/* Top review preview */}
        {topReview && (
          <p className="text-sm text-muted-foreground line-clamp-2 italic border-t border-border pt-4">
            "{topReview}"
          </p>
        )}
      </div>
    </Link>
  );
};

export default CompanyCard;
