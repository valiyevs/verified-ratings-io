import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';

interface FraudLog {
  id: string;
  review_id: string | null;
  user_id: string;
  ip_address: string | null;
  fraud_type: string | null;
  risk_score: number;
  similarity_score: number;
  is_copy_paste: boolean;
  typing_speed_wpm: number | null;
  created_at: string;
}

export const FraudDashboard = () => {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('review_fraud_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs((data as FraudLog[]) || []);
    setLoading(false);
  };

  const getRiskBadge = (score: number) => {
    if (score > 0.6) return <Badge variant="destructive">Yüksək Risk</Badge>;
    if (score > 0.3) return <Badge variant="secondary" className="text-yellow-600">Orta Risk</Badge>;
    return <Badge variant="outline">Aşağı Risk</Badge>;
  };

  const getFraudTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      ip_abuse: 'IP sui-istifadə',
      duplicate_content: 'Dublikat məzmun',
      bot_behavior: 'Bot davranışı',
      rapid_submission: 'Sürətli göndərmə',
      none: 'Normal',
    };
    return labels[type || 'none'] || type || 'N/A';
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

  const highRiskCount = logs.filter(l => l.risk_score > 0.6).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Yoxlamalar</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yüksək Riskli</p>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Copy-Paste</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {logs.filter(l => l.is_copy_paste).length}
                </p>
              </div>
              <ShieldAlert className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Saxtakarlıq Yoxlama Qeydləri
          </CardTitle>
          <CardDescription>Son 50 yoxlama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarix</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Risk Balı</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Oxşarlıq</TableHead>
                  <TableHead>Sürət</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className={log.risk_score > 0.6 ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                    <TableCell className="text-xs">
                      {new Date(log.created_at).toLocaleString('az-AZ')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ip_address || 'N/A'}</TableCell>
                    <TableCell>{getRiskBadge(log.risk_score)}</TableCell>
                    <TableCell className="text-sm">{getFraudTypeLabel(log.fraud_type)}</TableCell>
                    <TableCell>
                      {log.similarity_score > 0 ? `${Math.round(log.similarity_score * 100)}%` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.typing_speed_wpm ? `${Math.round(log.typing_speed_wpm)} s/d` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
