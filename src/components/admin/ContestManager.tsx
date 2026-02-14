import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Trophy, Plus, Loader2, Calendar } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  prize_description: string | null;
  prize_points: number;
  status: string;
  created_at: string;
}

export const ContestManager = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prizeDesc, setPrizeDesc] = useState('');
  const [prizePoints, setPrizePoints] = useState(500);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('review_contests')
      .select('*')
      .order('created_at', { ascending: false });
    setContests((data as Contest[]) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !endDate || !user) return;
    setSaving(true);
    const { error } = await supabase.from('review_contests').insert({
      title: title.trim(),
      description: description.trim() || null,
      end_date: new Date(endDate).toISOString(),
      prize_description: prizeDesc.trim() || null,
      prize_points: prizePoints,
      created_by: user.id,
    });
    if (error) {
      toast({ title: 'Xəta', variant: 'destructive' });
    } else {
      toast({ title: 'Yarışma yaradıldı' });
      setDialogOpen(false);
      setTitle(''); setDescription(''); setEndDate(''); setPrizeDesc('');
      fetchContests();
    }
    setSaving(false);
  };

  const handleEndContest = async (id: string) => {
    await supabase.from('review_contests').update({ status: 'ended' }).eq('id', id);
    toast({ title: 'Yarışma bitdi' });
    fetchContests();
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin mx-auto" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Rəy Yarışmaları
            </CardTitle>
            <CardDescription>Ayın ən yaxşı rəyi yarışması</CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Yeni Yarışma
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {contests.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">Hələ yarışma yoxdur</p>
        ) : (
          <div className="space-y-3">
            {contests.map((contest) => (
              <div key={contest.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{contest.title}</h4>
                    {contest.description && <p className="text-sm text-muted-foreground">{contest.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(contest.end_date).toLocaleDateString('az-AZ')}
                      </span>
                      <span>🎁 {contest.prize_description || `${contest.prize_points} xal`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={contest.status === 'active' ? 'default' : 'secondary'}>
                      {contest.status === 'active' ? 'Aktiv' : 'Bitmiş'}
                    </Badge>
                    {contest.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => handleEndContest(contest.id)}>
                        Bitir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Rəy Yarışması</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Yarışma adı" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Təsvir (ixtiyari)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Input placeholder="Mükafat təsviri" value={prizeDesc} onChange={(e) => setPrizeDesc(e.target.value)} />
            <Input type="number" placeholder="Mükafat xalı" value={prizePoints} onChange={(e) => setPrizePoints(Number(e.target.value))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={handleCreate} disabled={saving || !title.trim() || !endDate}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Yarat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
