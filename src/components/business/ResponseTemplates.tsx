import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Plus, Trash2, Copy, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
  usage_count: number;
}

interface ResponseTemplatesProps {
  companyId: string;
  onSelectTemplate?: (content: string) => void;
}

export const ResponseTemplates = ({ companyId, onSelectTemplate }: ResponseTemplatesProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [companyId]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('response_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('usage_count', { ascending: false });
    setTemplates((data as Template[]) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('response_templates').insert({
      company_id: companyId,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
    });
    if (error) {
      toast({ title: 'Xəta', variant: 'destructive' });
    } else {
      toast({ title: 'Şablon yaradıldı' });
      setDialogOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewCategory('general');
      fetchTemplates();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('response_templates').delete().eq('id', id);
    toast({ title: 'Şablon silindi' });
    fetchTemplates();
  };

  const handleUse = async (template: Template) => {
    onSelectTemplate?.(template.content);
    await supabase
      .from('response_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', template.id);
    toast({ title: 'Şablon seçildi' });
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      positive: 'Müsbət', negative: 'Mənfi', neutral: 'Neytral', general: 'Ümumi',
    };
    return labels[cat] || cat;
  };

  const getCategoryVariant = (cat: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      positive: 'default', negative: 'destructive', neutral: 'secondary', general: 'outline',
    };
    return variants[cat] || 'outline';
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin mx-auto" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Cavab Şablonları
            </CardTitle>
            <CardDescription>Tez cavab vermək üçün hazır şablonlar</CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Yeni Şablon
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Hələ şablon yaratmamısınız</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.title}</h4>
                    <Badge variant={getCategoryVariant(template.category)}>
                      {getCategoryLabel(template.category)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUse(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      İstifadə et
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{template.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.usage_count}x istifadə edilib</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Cavab Şablonu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Şablon adı"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Müsbət rəylər üçün</SelectItem>
                <SelectItem value="negative">Mənfi rəylər üçün</SelectItem>
                <SelectItem value="neutral">Neytral rəylər üçün</SelectItem>
                <SelectItem value="general">Ümumi</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Şablon mətni..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={handleCreate} disabled={saving || !newTitle.trim() || !newContent.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Yarat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
