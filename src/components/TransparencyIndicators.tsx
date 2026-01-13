import { CheckCircle2, MessageSquare, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransparencyIndicatorsProps {
  responseRate: number | null;
  avgResponseTimeHours: number | null;
  verifiedReviewsCount: number | null;
  totalReviewCount: number | null;
  isSponsored?: boolean;
}

const TransparencyIndicators = ({
  responseRate,
  avgResponseTimeHours,
  verifiedReviewsCount,
  totalReviewCount,
  isSponsored
}: TransparencyIndicatorsProps) => {
  const verifiedPercentage = totalReviewCount && totalReviewCount > 0 
    ? Math.round((verifiedReviewsCount || 0) / totalReviewCount * 100) 
    : 0;

  const getResponseTimeLabel = (hours: number | null) => {
    if (!hours) return 'N/A';
    if (hours < 1) return '< 1 saat';
    if (hours < 24) return `${Math.round(hours)} saat`;
    return `${Math.round(hours / 24)} gün`;
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-foreground">Şəffaflıq Göstəriciləri</h3>
        {isSponsored && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Sponsorlu
          </Badge>
        )}
      </div>
      
      <div className="space-y-5">
        {/* FIN Verified Reviews */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 cursor-help">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">FIN təsdiqli rəylər</span>
                  </div>
                  <span className="font-medium text-foreground">{verifiedPercentage}%</span>
                </div>
                <Progress value={verifiedPercentage} className="h-2" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>FIN kodu ilə təsdiqlənmiş istifadəçilərdən gələn rəylərin faizi</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Response Rate */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2 cursor-help">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Cavab faizi</span>
                  </div>
                  <span className={`font-medium ${getResponseRateColor(responseRate || 0)}`}>
                    {(responseRate || 0).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={responseRate || 0} 
                  className="h-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Şirkətin rəylərə rəsmi cavab vermə faizi</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Average Response Time */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between text-sm cursor-help">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Orta cavab müddəti</span>
                </div>
                <span className="font-medium text-foreground">
                  {getResponseTimeLabel(avgResponseTimeHours)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rəylərə cavab vermək üçün orta gözləmə müddəti</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Verified Reviews Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Təsdiqli rəy sayı</span>
          </div>
          <span className="font-medium text-foreground">
            {verifiedReviewsCount || 0} / {totalReviewCount || 0}
          </span>
        </div>
      </div>

      {/* Trust Level Indicator */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {(responseRate || 0) >= 70 && verifiedPercentage >= 50 ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Yüksək Etibarlılıq
              </span>
            </>
          ) : (responseRate || 0) >= 40 && verifiedPercentage >= 25 ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Orta Etibarlılıq
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Aşağı Etibarlılıq
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransparencyIndicators;
