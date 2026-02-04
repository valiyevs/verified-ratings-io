import { Megaphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SponsoredBadgeProps {
  compact?: boolean;
}

const SponsoredBadge = ({ compact = false }: SponsoredBadgeProps) => {
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Megaphone className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Sponsorlu şirkət - sıralama üstünlüyü</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-800">
      <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
        Sponsorlu
      </span>
    </div>
  );
};

export default SponsoredBadge;
