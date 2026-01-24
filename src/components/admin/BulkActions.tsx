import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ChevronDown, Check, X, Loader2, Trash2 } from 'lucide-react';

interface BulkActionsProps {
  selectedIds: string[];
  entityType: 'companies' | 'reviews';
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export const BulkActions = ({ 
  selectedIds, 
  entityType, 
  onActionComplete,
  onClearSelection 
}: BulkActionsProps) => {
  const [processing, setProcessing] = useState(false);

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    setProcessing(true);

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from(entityType)
          .delete()
          .in('id', selectedIds);
        
        if (error) throw error;
        toast({ title: `${selectedIds.length} element silindi` });
      } else {
        const status = action === 'approve' ? 'approved' : 'rejected';
        const { error } = await supabase
          .from(entityType)
          .update({ status })
          .in('id', selectedIds);
        
        if (error) throw error;
        toast({ title: `${selectedIds.length} element ${action === 'approve' ? 'təsdiqləndi' : 'rədd edildi'}` });
      }
      
      onClearSelection();
      onActionComplete();
    } catch (err) {
      console.error('Bulk action error:', err);
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedIds.length} element seçildi
      </span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" disabled={processing}>
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Əməliyyat
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleBulkAction('approve')}>
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Hamısını Təsdiqlə
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleBulkAction('reject')}>
            <X className="h-4 w-4 mr-2 text-red-500" />
            Hamısını Rədd Et
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleBulkAction('delete')}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hamısını Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        size="sm" 
        variant="ghost" 
        onClick={onClearSelection}
      >
        Seçimi ləğv et
      </Button>
    </div>
  );
};

interface SelectableRowProps {
  id: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export const SelectableCheckbox = ({ id, selected, onToggle }: SelectableRowProps) => (
  <Checkbox
    checked={selected}
    onCheckedChange={() => onToggle(id)}
    onClick={(e) => e.stopPropagation()}
  />
);
