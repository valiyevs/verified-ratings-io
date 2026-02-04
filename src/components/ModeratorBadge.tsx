import { ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModeratorBadgeProps {
  compact?: boolean;
}

const ModeratorBadge = ({ compact = false }: ModeratorBadgeProps) => {
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full">
              <ShieldCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Moderator tərəfindən təsdiqlənib</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
      <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
      <span className="text-xs font-medium text-green-700 dark:text-green-300">
        Moderator Təsdiqi
      </span>
    </div>
  );
};

export default ModeratorBadge;
