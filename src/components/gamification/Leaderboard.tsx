import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  full_name: string | null;
  total_points: number;
  total_reviews: number;
  total_helpful: number;
  badge_count: number;
  rank: number;
}

export const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(20);
    
    const ranked = (data || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
    setEntries(ranked as LeaderboardEntry[]);
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Liderlik Cədvəli
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Hələ liderlik cədvəli boşdur</p>
            <p className="text-sm mt-1">Rəy yazaraq cədvələ düşün!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  entry.user_id === user?.id 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <p className="font-medium">
                      {entry.full_name || 'Anonim'}
                      {entry.user_id === user?.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">Siz</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.total_reviews} rəy · {entry.total_helpful} faydalı · {entry.badge_count} nişan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{entry.total_points}</p>
                  <p className="text-xs text-muted-foreground">xal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
