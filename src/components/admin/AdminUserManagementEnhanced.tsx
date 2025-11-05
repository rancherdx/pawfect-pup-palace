import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Search, Shield, UserCog, Trash2, Plus, 
  Loader2, Eye, Mail, Calendar, Clock, KeyRound, 
  Link as LinkIcon, Edit2, Upload, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  secondary_email: string | null;
  preferred_name: string | null;
  preferred_contact: string | null;
  profile_photo_url: string | null;
  created_at: string;
  roles: string[];
  last_sign_in_at: string | null;
  force_password_change: boolean | null;
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
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('');
  const isMobile = useIsMobile();

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    sendWelcomeEmail: false,
    setPassword: false,
    roles: ['user']
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    secondary_email: '',
    preferred_name: '',
    profile_photo_url: ''
  });

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
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const { data: allRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

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
          secondary_email: profile.secondary_email,
          preferred_name: profile.preferred_name,
          preferred_contact: profile.preferred_contact,
          profile_photo_url: profile.profile_photo_url,
          created_at: profile.created_at,
          roles: userRoles,
          last_sign_in_at: authUser?.last_sign_in_at || null,
          force_password_change: profile.force_password_change
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
    setIsUserDetailsOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const body: any = {
        email: createFormData.email,
        name: createFormData.name,
        phone: createFormData.phone || null,
        assignRoles: createFormData.roles
      };

      if (createFormData.setPassword && createFormData.password) {
        body.password = createFormData.password;
      } else if (createFormData.sendWelcomeEmail) {
        body.sendWelcomeEmail = true;
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body,
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to create user');
      }

      toast.success('User created successfully');
      setIsCreateUserOpen(false);
      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        sendWelcomeEmail: false,
        setPassword: false,
        roles: ['user']
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: {
          userId: selectedUser.id,
          updates: editFormData
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to update user');
      }

      toast.success('User updated successfully');
      setIsEditUserOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: userToDelete.id },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      setSelectedUser(null);
      setIsUserDetailsOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
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

      const { error } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: selectedUser.id, 
          role: selectedRole as any
        }]);

      if (error) throw error;

      toast.success(`Role "${selectedRole}" added successfully`);
      setSelectedRole('');
      fetchUsers();
      if (selectedUser) {
        const updatedUser = users.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser({ ...updatedUser, roles: [...updatedUser.roles, selectedRole] });
        }
      }
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    }
  };

  const handleRemoveRole = async (roleToRemove: string) => {
    if (!selectedUser) return;

    if (selectedUser.roles.filter(r => r === 'super-admin').length === 1 && roleToRemove === 'super-admin') {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super-admin');

      if (count && count <= 1) {
        toast.error('Cannot remove the last super-admin role');
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id)
        .eq('role', roleToRemove as any);

      if (error) throw error;

      toast.success(`Role "${roleToRemove}" removed successfully`);
      fetchUsers();
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, roles: selectedUser.roles.filter(r => r !== roleToRemove) });
      }
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const handleResetPassword = async (sendEmail: boolean) => {
    if (!selectedUser) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: selectedUser.id,
          sendResetEmail: sendEmail
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to reset password');
      }

      if (data?.temporaryPassword) {
        setTempPassword(data.temporaryPassword);
      }

      toast.success(data?.message || 'Password reset successfully');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleSendMagicLink = async () => {
    if (!selectedUser) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-send-magic-link', {
        body: { userId: selectedUser.id },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to send magic link');
      }

      toast.success('Magic link sent successfully');
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      toast.error(error.message || 'Failed to send magic link');
    }
  };

  const openEditUser = (user: UserProfile) => {
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      secondary_email: user.secondary_email || '',
      preferred_name: user.preferred_name || '',
      profile_photo_url: user.profile_photo_url || ''
    });
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "secondary" => {
    switch (role) {
      case 'super-admin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const UserDetailsContent = () => (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <Avatar className="h-16 w-16">
            <AvatarImage src={selectedUser?.profile_photo_url || ''} />
            <AvatarFallback>{selectedUser?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{selectedUser?.name || 'Unnamed User'}</h3>
            <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Phone:</span>
            <div className="mt-1">{selectedUser?.phone || 'N/A'}</div>
          </div>
          <div>
            <span className="font-semibold">Secondary Email:</span>
            <div className="mt-1">{selectedUser?.secondary_email || 'N/A'}</div>
          </div>
          <div>
            <span className="font-semibold">Preferred Name:</span>
            <div className="mt-1">{selectedUser?.preferred_name || 'N/A'}</div>
          </div>
          <div>
            <span className="font-semibold">Joined:</span>
            <div className="mt-1">{selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div>
            <span className="font-semibold">Last Sign In:</span>
            <div className="mt-1">
              {selectedUser?.last_sign_in_at
                ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                : 'Never'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-semibold">Recent Activity:</span>
          <Card>
            <CardContent className="pt-4">
              {userAuditLogs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userAuditLogs.map((log) => (
                    <div key={log.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                      <span className="font-medium">{log.event_type}</span>
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => openEditUser(selectedUser!)} variant="outline" className="flex-1">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
          <Button
            onClick={() => {
              setUserToDelete(selectedUser);
              setIsDeleteDialogOpen(true);
            }}
            variant="destructive"
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="roles" className="space-y-4">
        <div>
          <span className="font-semibold mb-2 block">Current Roles:</span>
          <div className="flex gap-2 flex-wrap mb-4">
            {selectedUser?.roles.map((role) => (
              <Badge key={role} variant={getRoleBadgeVariant(role)} className="gap-1">
                {role}
                <X
                  className="h-3 w-3 cursor-pointer hover:opacity-70"
                  onClick={() => handleRemoveRole(role)}
                />
              </Badge>
            ))}
            {selectedUser?.roles.length === 0 && (
              <Badge variant="outline">No roles</Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Add Role</Label>
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddRole} disabled={!selectedRole}>
              <UserCog className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Password Management</h4>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleResetPassword(true)}
                variant="outline"
                className="justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Password Reset Email
              </Button>
              <Button
                onClick={() => handleResetPassword(false)}
                variant="outline"
                className="justify-start"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Generate Temporary Password
              </Button>
              {tempPassword && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-semibold mb-1">Temporary Password:</p>
                  <code className="text-sm">{tempPassword}</code>
                  <p className="text-xs text-muted-foreground mt-2">
                    User will be required to change this on next login.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Magic Link Login</h4>
            <Button
              onClick={handleSendMagicLink}
              variant="outline"
              className="w-full justify-start"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Send Magic Link
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const DetailsWrapper = isMobile ? Sheet : Dialog;
  const DetailsContent = isMobile ? SheetContent : DialogContent;
  const DetailsHeader = isMobile ? SheetHeader : DialogHeader;
  const DetailsTitle = isMobile ? SheetTitle : DialogTitle;
  const DetailsDescription = isMobile ? SheetDescription : DialogDescription;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          <h2 className="text-xl sm:text-2xl font-bold">User Management</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          <Button onClick={() => setIsCreateUserOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {filteredUsers.map((user) => (
          <Card 
            key={user.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewUser(user)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={user.profile_photo_url || ''} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2 truncate">
                      <span className="truncate">{user.name || 'Unnamed User'}</span>
                      {user.roles.includes('super-admin') && (
                        <Shield className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate mt-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {user.roles.slice(0, 2).map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                        {role}
                      </Badge>
                    ))}
                    {user.roles.length > 2 && (
                      <Badge variant="outline" className="text-xs">+{user.roles.length - 2}</Badge>
                    )}
                    {user.roles.length === 0 && (
                      <Badge variant="outline" className="text-xs">No roles</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 flex-shrink-0" />
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

      {/* User Details */}
      <DetailsWrapper open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DetailsContent className={isMobile ? "w-full" : "max-w-2xl max-h-[90vh] overflow-y-auto"}>
          <DetailsHeader>
            <DetailsTitle>User Details</DetailsTitle>
            <DetailsDescription>
              View and manage user information and activity
            </DetailsDescription>
          </DetailsHeader>
          {selectedUser && <UserDetailsContent />}
        </DetailsContent>
      </DetailsWrapper>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">Phone</Label>
              <Input
                id="create-phone"
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="set-password">Set Password</Label>
                <Switch
                  id="set-password"
                  checked={createFormData.setPassword}
                  onCheckedChange={(checked) => 
                    setCreateFormData({ 
                      ...createFormData, 
                      setPassword: checked,
                      sendWelcomeEmail: checked ? false : createFormData.sendWelcomeEmail
                    })
                  }
                />
              </div>
              
              {createFormData.setPassword && (
                <Input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  placeholder="Enter password"
                />
              )}

              {!createFormData.setPassword && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-welcome">Send Welcome Email</Label>
                  <Switch
                    id="send-welcome"
                    checked={createFormData.sendWelcomeEmail}
                    onCheckedChange={(checked) => 
                      setCreateFormData({ ...createFormData, sendWelcomeEmail: checked })
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={!createFormData.name || !createFormData.email}
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-secondary-email">Secondary Email</Label>
              <Input
                id="edit-secondary-email"
                type="email"
                value={editFormData.secondary_email}
                onChange={(e) => setEditFormData({ ...editFormData, secondary_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preferred-name">Preferred Name</Label>
              <Input
                id="edit-preferred-name"
                value={editFormData.preferred_name}
                onChange={(e) => setEditFormData({ ...editFormData, preferred_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-photo-url">Profile Photo URL</Label>
              <Input
                id="edit-photo-url"
                value={editFormData.profile_photo_url}
                onChange={(e) => setEditFormData({ ...editFormData, profile_photo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? 
              This action cannot be undone and will permanently delete all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}