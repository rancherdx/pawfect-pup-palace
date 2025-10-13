import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Search, Shield, UserCog, Ban, CheckCircle, 
  Loader2, Eye, Mail, Calendar, Clock 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  roles: string[];
  last_sign_in_at: string | null;
}

interface AuditLog {
  id: string;
  event_type: string;
  created_at: string;
  ip_address: string | null;
}

export default function AdminUserManagementEnhanced() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userAuditLogs, setUserAuditLogs] = useState<AuditLog[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name?.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from auth.users via profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, phone, created_at');

      if (profilesError) throw profilesError;

      // Get auth users list
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Fetch roles for all users
      const { data: allRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Combine data
      const usersWithAuth = (profiles || []).map((profile) => {
        const authUser = authUsers?.find((u: any) => u.id === profile.id);
        const userRoles = (allRoles || [])
          .filter((r: any) => r.user_id === profile.id)
          .map((r: any) => r.role as string) || [];

        return {
          id: profile.id,
          name: profile.name,
          email: authUser?.email || 'N/A',
          phone: profile.phone,
          created_at: profile.created_at,
          roles: userRoles,
          last_sign_in_at: authUser?.last_sign_in_at || null,
        };
      });

      setUsers(usersWithAuth);
      setFilteredUsers(usersWithAuth);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAuditLogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('id, event_type, created_at, ip_address')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const logsWithStringIP = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : null
      }));
      
      setUserAuditLogs(logsWithStringIP);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  const handleViewUser = async (user: UserProfile) => {
    setSelectedUser(user);
    await fetchUserAuditLogs(user.id);
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      // First, check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', selectedUser.id)
        .eq('role', selectedRole as any)
        .maybeSingle();

      if (existingRole) {
        toast.info('User already has this role');
        return;
      }

      // Add the new role - cast to proper type
      const { error } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: selectedUser.id, 
          role: selectedRole as 'admin' | 'moderator' | 'super-admin' | 'user'
        }]);

      if (error) throw error;

      toast.success(`Role "${selectedRole}" added successfully`);
      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error('Failed to change user role');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {user.name || 'Unnamed User'}
                    {user.roles.includes('super-admin') && (
                      <Shield className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {user.roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {role}
                      </Badge>
                    ))}
                    {user.roles.length === 0 && (
                      <Badge variant="outline">No roles</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewUser(user)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last sign in:</span>
                  <span>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information and activity
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Name:</span>
                  <div className="mt-1">{selectedUser.name || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-semibold">Email:</span>
                  <div className="mt-1">{selectedUser.email}</div>
                </div>
                <div>
                  <span className="font-semibold">Phone:</span>
                  <div className="mt-1">{selectedUser.phone || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-semibold">Roles:</span>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {selectedUser.roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Recent Activity:</span>
                </div>
                <Card>
                  <CardContent className="pt-4">
                    {userAuditLogs.length > 0 ? (
                      <div className="space-y-2">
                        {userAuditLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex justify-between text-sm border-b pb-2 last:border-0"
                          >
                            <span className="font-medium">{log.event_type}</span>
                            <span className="text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No recent activity
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsRoleDialogOpen(true)}
                  variant="outline"
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Select a role to add to {selectedUser?.name || 'this user'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>Add Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
