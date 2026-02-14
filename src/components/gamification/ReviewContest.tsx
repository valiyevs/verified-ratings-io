import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Calendar, Gift, Loader2 } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  prize_description: string | null;
  prize_points: number;
  status: string;
}

export const ReviewContest = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('review_contests')
      .select('*')
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: true });
    setContests((data as Contest[]) || []);
    setLoading(false);
  };

  const getDaysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin mx-auto" />;
  }

  if (contests.length === 0) return null;

  return (
    <div className="space-y-4">
      {contests.map((contest) => (
        <Card key={contest.id} className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {contest.title}
              </CardTitle>
              <Badge variant="default" className="bg-green-500">
                Aktiv
              </Badge>
            </div>
            {contest.description && (
              <CardDescription>{contest.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{getDaysLeft(contest.end_date)} gün qalıb</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-yellow-500" />
                <span>{contest.prize_description || `${contest.prize_points} xal mükafat`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
