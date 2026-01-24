import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Star, MessageSquare, ClipboardList, Trophy, Loader2, Coins } from 'lucide-react';

interface Reward {
  id: string;
  points: number;
  action_type: string;
  description: string;
  created_at: string;
}

interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: string;
}

const LEVELS: Level[] = [
  { name: 'Başlanğıc', minPoints: 0, maxPoints: 99, icon: '🌱', color: 'text-gray-500' },
  { name: 'Aktiv', minPoints: 100, maxPoints: 499, icon: '⭐', color: 'text-blue-500' },
  { name: 'Etibarlı', minPoints: 500, maxPoints: 999, icon: '🏅', color: 'text-yellow-500' },
  { name: 'Ekspert', minPoints: 1000, maxPoints: 4999, icon: '🏆', color: 'text-orange-500' },
  { name: 'Lider', minPoints: 5000, maxPoints: Infinity, icon: '👑', color: 'text-purple-500' },
];

const POINT_VALUES: Record<string, { points: number; label: string }> = {
  review: { points: 50, label: 'Rəy yazmaq' },
  survey: { points: 30, label: 'Sorğuya cavab' },
  helpful: { points: 5, label: 'Faydalı səs' },
  verified: { points: 100, label: 'FIN doğrulama' },
  first_review: { points: 100, label: 'İlk rəy bonusu' },
};

export const RewardsCenter = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user]);

  const fetchRewards = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch rewards history
    const { data: rewardsData } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fetch total points from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    if (rewardsData) setRewards(rewardsData);
    if (profileData) setTotalPoints(profileData.total_points || 0);
    setLoading(false);
  };

  const getCurrentLevel = (): Level => {
    return LEVELS.find(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints) || LEVELS[0];
  };

  const getNextLevel = (): Level | null => {
    const currentIndex = LEVELS.findIndex(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints);
    return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
  };

  const getProgressToNextLevel = (): number => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;
    
    const progressInLevel = totalPoints - currentLevel.minPoints;
    const levelRange = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min((progressInLevel / levelRange) * 100, 100);
  };

  const getRewardIcon = (actionType: string) => {
    switch (actionType) {
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'survey': return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case 'helpful': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'verified': return <Trophy className="h-4 w-4 text-purple-500" />;
      default: return <Gift className="h-4 w-4 text-primary" />;
    }
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                {currentLevel.icon}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${currentLevel.color}`}>
                  {currentLevel.name}
                </h2>
                <p className="text-muted-foreground">Səviyyəniz</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-500" />
                <span className="text-3xl font-bold">{totalPoints}</span>
              </div>
              <p className="text-sm text-muted-foreground">Toplam xal</p>
            </div>
          </div>

          {nextLevel && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{currentLevel.name}</span>
                <span>{nextLevel.name}</span>
              </div>
              <Progress value={getProgressToNextLevel()} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {nextLevel.minPoints - totalPoints} xal sonrakı səviyyəyə
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Xal Qazanma Yolları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(POINT_VALUES).map(([key, value]) => (
              <div 
                key={key}
                className="p-4 rounded-lg border bg-card text-center"
              >
                <div className="text-2xl font-bold text-primary mb-1">
                  +{value.points}
                </div>
                <p className="text-sm text-muted-foreground">{value.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xal Tarixçəsi</CardTitle>
          <CardDescription>Son qazandığınız xallar</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Hələ xal qazanmamısınız</p>
                <p className="text-sm mt-1">Rəy yazaraq xal qazanmağa başlayın!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getRewardIcon(reward.action_type)}
                      </div>
                      <div>
                        <p className="font-medium">{reward.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reward.created_at).toLocaleDateString('az-AZ')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      +{reward.points}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Levels Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Səviyyələr
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEVELS.map((level) => (
              <div 
                key={level.name}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  level.name === currentLevel.name ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.icon}</span>
                  <span className={`font-medium ${level.color}`}>{level.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {level.maxPoints === Infinity 
                    ? `${level.minPoints}+ xal` 
                    : `${level.minPoints} - ${level.maxPoints} xal`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
