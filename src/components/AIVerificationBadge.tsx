import { Bot, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AIVerificationBadgeProps {
  status: 'verified' | 'pending' | 'flagged' | 'rejected' | 'analyzing';
  score?: number;
  compact?: boolean;
}

const AIVerificationBadge = ({ status, score, compact = false }: AIVerificationBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          label: 'AI Doğrulandı',
          description: `Orijinallıq skoru: ${score || 0}%`,
          variant: 'default' as const,
          className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
        };
      case 'pending':
        return {
          icon: Bot,
          label: 'Yoxlanılır',
          description: 'Moderator tərəfindən yoxlanılır',
          variant: 'secondary' as const,
          className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
        };
      case 'flagged':
        return {
          icon: AlertTriangle,
          label: 'Bayraqlandı',
          description: 'Şübhəli məzmun aşkarlandı',
          variant: 'destructive' as const,
          className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rədd edildi',
          description: 'Rəy saxta və ya spam olaraq müəyyən edildi',
          variant: 'destructive' as const,
          className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
        };
      case 'analyzing':
        return {
          icon: Loader2,
          label: 'Analiz edilir',
          description: 'AI rəyi analiz edir...',
          variant: 'outline' as const,
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
        };
      default:
        return {
          icon: Bot,
          label: 'Bilinmir',
          description: 'Status bilinmir',
          variant: 'outline' as const,
          className: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div className={`p-1 rounded ${config.className}`}>
            <Icon className={`w-4 h-4 ${status === 'analyzing' ? 'animate-spin' : ''}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant={config.variant} className={`flex items-center gap-1.5 ${config.className}`}>
          <Icon className={`w-3.5 h-3.5 ${status === 'analyzing' ? 'animate-spin' : ''}`} />
          <span>{config.label}</span>
          {score !== undefined && status === 'verified' && (
            <span className="text-xs opacity-80">({score}%)</span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AIVerificationBadge;
