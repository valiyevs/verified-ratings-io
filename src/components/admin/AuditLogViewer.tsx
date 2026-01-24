import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Clock, User, Building2, MessageSquare, Shield } from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  user_email?: string;
}

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      // Get user emails
      const userIds = [...new Set(data.map(log => log.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const logsWithEmails = data.map(log => ({
        ...log,
        user_email: profiles?.find(p => p.user_id === log.user_id)?.email || 'Naməlum'
      }));
      setLogs(logsWithEmails);
    }
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      create: 'default',
      update: 'secondary',
      delete: 'destructive',
      approve: 'default',
      reject: 'destructive',
    };
    return <Badge variant={variants[action] || 'outline'}>{action}</Badge>;
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'company': return <Building2 className="h-4 w-4" />;
      case 'review': return <MessageSquare className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = search === '' || 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || log.entity_type === filter;
    
    return matchesSearch && matchesFilter;
  });

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
          <Clock className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <CardDescription>Bütün admin əməliyyatlarının tarixçəsi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Axtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'company', 'review', 'user'].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filter === type ? 'default' : 'outline'}
                onClick={() => setFilter(type)}
              >
                {type === 'all' ? 'Hamısı' : type === 'company' ? 'Şirkətlər' : type === 'review' ? 'Rəylər' : 'İstifadəçilər'}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Log tapılmadı</p>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-muted">
                    {getEntityIcon(log.entity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      <span className="text-sm font-medium capitalize">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.entity_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.user_email} tərəfindən
                    </p>
                    {log.new_data && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto max-w-full">
                        {JSON.stringify(log.new_data, null, 2).slice(0, 200)}...
                      </pre>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('az-AZ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
