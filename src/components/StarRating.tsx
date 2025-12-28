import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showValue = true,
  interactive = false,
  onRatingChange
}: StarRatingProps) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const partial = index === Math.floor(rating) && rating % 1 !== 0;

          return (
            <div 
              key={index} 
              className={cn("relative", interactive && "cursor-pointer")}
              onClick={() => handleClick(index)}
            >
              <Star
                className={cn(
                  sizes[size],
                  "text-border transition-colors",
                  interactive && "hover:text-gold/50"
                )}
                fill="currentColor"
              />
              {(filled || partial) && (
                <Star
                  className={cn(
                    sizes[size],
                    "absolute inset-0 text-gold pointer-events-none"
                  )}
                  fill="currentColor"
                  style={{
                    clipPath: partial ? `inset(0 ${(1 - (rating % 1)) * 100}% 0 0)` : undefined,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-semibold text-foreground", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
