import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Trash2, Building2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  company_name?: string;
}

interface CompanyOption {
  id: string;
  name: string;
}

interface UserOption {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export const CompanyMemberManager = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add member form
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUsers, setFoundUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch all companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'approved')
      .order('name');

    if (companiesData) setCompanies(companiesData);

    // Fetch all members
    const { data: membersData } = await supabase
      .from('company_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (membersData && membersData.length > 0) {
      const userIds = [...new Set(membersData.map(m => m.user_id))];
      const companyIds = [...new Set(membersData.map(m => m.company_id))];

      const [{ data: profiles }, { data: companyNames }] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, email').in('user_id', userIds),
        supabase.from('companies').select('id, name').in('id', companyIds),
      ]);

      const enriched: CompanyMember[] = membersData.map(m => ({
        ...m,
        user_name: profiles?.find(p => p.user_id === m.user_id)?.full_name || undefined,
        user_email: profiles?.find(p => p.user_id === m.user_id)?.email || undefined,
        company_name: companyNames?.find(c => c.id === m.company_id)?.name || undefined,
      }));
      setMembers(enriched);
    } else {
      setMembers([]);
    }

    setLoading(false);
  };

  const searchUsers = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);

    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .or(`email.ilike.%${searchEmail}%,full_name.ilike.%${searchEmail}%`)
      .limit(10);

    setFoundUsers(data || []);
    setSearching(false);
  };

  const addMember = async () => {
    if (!selectedCompanyId || !selectedUserId || !selectedRole) {
      toast({ title: 'Bütün sahələri doldurun', variant: 'destructive' });
      return;
    }

    setAdding(true);
    const { error } = await supabase
      .from('company_members')
      .insert({
        company_id: selectedCompanyId,
        user_id: selectedUserId,
        role: selectedRole as 'manager' | 'employee',
        invited_by: user?.id,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Bu istifadəçi artıq bu şirkətə təyin edilib', variant: 'destructive' });
      } else {
        toast({ title: 'Xəta baş verdi', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Üzv uğurla əlavə edildi' });
      setDialogOpen(false);
      resetForm();
      fetchData();
    }
    setAdding(false);
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: 'Üzv silindi' });
      fetchData();
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from('company_members')
      .update({ role: newRole as 'manager' | 'employee' })
      .eq('id', memberId);

    if (error) {
      toast({ title: 'Xəta baş verdi', variant: 'destructive' });
    } else {
      toast({ title: 'Rol yeniləndi' });
      fetchData();
    }
  };

  const resetForm = () => {
    setSelectedCompanyId('');
    setSearchEmail('');
    setFoundUsers([]);
    setSelectedUserId('');
    setSelectedRole('employee');
  };

  const getRoleBadge = (role: string) => {
    return role === 'manager' 
      ? <Badge variant="default">Rəhbər</Badge>
      : <Badge variant="secondary">Əməkdaş</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Şirkət Üzvləri
            </CardTitle>
            <CardDescription>İstifadəçiləri şirkətlərə rəhbər və ya əməkdaş olaraq təyin edin</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Üzv Əlavə Et
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Heç bir şirkət üzvü yoxdur</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Şirkət</TableHead>
                <TableHead>İstifadəçi</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Tarix</TableHead>
                <TableHead>Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.company_name || member.company_id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.user_name || 'Naməlum'}</p>
                      <p className="text-xs text-muted-foreground">{member.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(val) => updateMemberRole(member.id, val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Rəhbər</SelectItem>
                        <SelectItem value="employee">Əməkdaş</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(member.created_at).toLocaleDateString('az-AZ')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şirkətə Üzv Əlavə Et</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Şirkət</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Şirkət seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>İstifadəçi Axtar</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="E-poçt və ya ad ilə axtar..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                />
                <Button variant="outline" onClick={searchUsers} disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {foundUsers.length > 0 && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {foundUsers.map(u => (
                  <button
                    key={u.user_id}
                    className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${
                      selectedUserId === u.user_id ? 'bg-primary/10 border-l-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedUserId(u.user_id)}
                  >
                    <p className="font-medium text-sm">{u.full_name || 'Adsız'}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </button>
                ))}
              </div>
            )}

            <div>
              <Label>Rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Rəhbər (İdarəetmə hüquqları)</SelectItem>
                  <SelectItem value="employee">Əməkdaş (Məhdud giriş)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={addMember} disabled={adding || !selectedCompanyId || !selectedUserId}>
              {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Təyin Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
