import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Award, Loader2 } from 'lucide-react';

interface UserBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  badge_description: string | null;
  earned_at: string;
}

interface BadgeDisplayProps {
  userId?: string;
  compact?: boolean;
}

export const BadgeDisplay = ({ userId, compact = false }: BadgeDisplayProps) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) fetchBadges();
  }, [targetUserId]);

  const fetchBadges = async () => {
    if (!targetUserId) return;
    setLoading(true);
    const { data } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false });
    setBadges((data as UserBadge[]) || []);
    setLoading(false);
  };

  // Trigger badge check when viewing own badges
  useEffect(() => {
    if (user && targetUserId === user.id) {
      supabase.functions.invoke('check-badges').catch(console.error);
    }
  }, [user, targetUserId]);

  if (loading) {
    return compact ? null : <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (badges.length === 0 && compact) return null;

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex flex-wrap gap-1">
          {badges.slice(0, 5).map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <span className="text-lg cursor-help">{badge.badge_icon}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{badge.badge_name}</p>
                <p className="text-xs text-muted-foreground">{badge.badge_description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {badges.length > 5 && (
            <Badge variant="secondary" className="text-xs">+{badges.length - 5}</Badge>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Nişanlar ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Hələ nişan qazanmamısınız</p>
            <p className="text-sm mt-1">Rəy yazaraq nişan qazanmağa başlayın!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 rounded-xl border bg-card hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl mb-2">{badge.badge_icon}</span>
                <p className="font-medium text-sm">{badge.badge_name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.badge_description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(badge.earned_at).toLocaleDateString('az-AZ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
