import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewHistoryItem {
  id: string;
  old_title: string | null;
  old_content: string | null;
  old_rating: number | null;
  created_at: string;
}

interface ReviewHistoryModalProps {
  reviewId: string;
  currentTitle: string;
  currentContent: string;
  currentRating: number;
}

const ReviewHistoryModal = ({ 
  reviewId, 
  currentTitle, 
  currentContent, 
  currentRating 
}: ReviewHistoryModalProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchHistory();
    }
  }, [open, reviewId, user]);

  const fetchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('review_history')
      .select('*')
      .eq('review_id', reviewId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  if (history.length === 0 && !loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <History className="w-3 h-3" />
          <span>Düzəliş tarixçəsi</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Rəy Düzəliş Tarixçəsi
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Current version */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-primary">Cari versiya</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{currentRating}</span>
              </div>
            </div>
            <h4 className="font-medium text-foreground mb-1">{currentTitle}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">{currentContent}</p>
          </div>

          {/* History items */}
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Yüklənir...
            </div>
          ) : history.length > 0 ? (
            history.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-secondary/50 rounded-lg p-4 border border-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('az-AZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {item.old_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.old_rating}</span>
                    </div>
                  )}
                </div>
                {item.old_title && (
                  <h4 className="font-medium text-muted-foreground mb-1 line-through opacity-70">
                    {item.old_title}
                  </h4>
                )}
                {item.old_content && (
                  <p className="text-sm text-muted-foreground line-clamp-3 opacity-70">
                    {item.old_content}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Bu rəydə düzəliş edilməyib.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewHistoryModal;
