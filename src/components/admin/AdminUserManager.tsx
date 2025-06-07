import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ArrowLeft, ArrowRight, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { fetchAdminAPI } from '@/api';

interface User {
  id: string;
  name: string | null;
  email: string;
  roles: string[];
  created_at: string;
  updated_at: string;
}

interface UsersApiResponse {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

const AVAILABLE_ROLES = ['user', 'admin', 'editor', 'super-admin']; // Define available roles

const AdminUserManager: React.FC = () => {
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingRoles, setEditingRoles] = useState<string[]>([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchUserQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchUserQuery]);

  const fetchUsers = async ({ queryKey }: any): Promise<UsersApiResponse> => {
    const [_key, page, limit, search] = queryKey;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('searchQuery', search);
    }
    return fetchAdminAPI(`/api/admin/users?${params.toString()}`);
  };

  const { data, isLoading, isError, error, isPreviousData } = useQuery<UsersApiResponse, Error>(
    ['adminUsers', currentPage, rowsPerPage, debouncedSearchQuery],
    fetchUsers,
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      onError: (err) => {
        toast.error(`Failed to fetch users: ${err.message}`);
      }
    }
  );

  // Mutation for updating user roles
  const editUserMutation = useMutation(
    ({ userId, roles }: { userId: string, roles: string[] }) =>
      fetchAdminAPI(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ roles }),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminUsers']);
        setShowEditRoleModal(false);
        setSelectedUser(null);
        toast.success('User roles updated successfully!');
      },
      onError: (err: Error) => {
        toast.error(`Failed to update user roles: ${err.message}`);
      },
    }
  );

  // Mutation for deleting a user
  const deleteUserMutation = useMutation(
    (userId: string) =>
      fetchAdminAPI(`/api/admin/users/${userId}`, { method: 'DELETE' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminUsers']);
        setShowDeleteConfirmModal(false);
        setSelectedUser(null);
        toast.success('User deleted successfully!');
      },
      onError: (err: Error) => {
        toast.error(`Failed to delete user: ${err.message}`);
      },
    }
  );

  const openEditRoleModal = (user: User) => {
    setSelectedUser(user);
    setEditingRoles(user.roles || []);
    setShowEditRoleModal(true);
  };

  const openDeleteConfirmModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirmModal(true);
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setEditingRoles(prev =>
      checked ? [...prev, role] : prev.filter(r => r !== role)
    );
  };

  const handleSaveRoles = () => {
    if (selectedUser) {
      editUserMutation.mutate({ userId: selectedUser.id, roles: editingRoles });
    }
  };

  const handleDeleteConfirmed = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Search and Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center text-gray-800 dark:text-white">
          <Users className="mr-3 h-7 w-7 text-brand-red" />
          User Management
        </h2>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Registered At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={`skeleton-user-${index}`}>
                  <TableCell colSpan={5} className="py-3"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-red-500">Error: {error?.message || "Unknown error"}</TableCell></TableRow>
            ) : data?.users?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">No users found.</TableCell></TableRow>
            ) : (
              data?.users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles?.map(role => (<Badge key={role} variant="secondary" className="mr-1 text-xs">{role}</Badge>))}</TableCell>
                  <TableCell className="text-xs">{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" title="Edit User Roles" onClick={() => openEditRoleModal(user)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" title="Delete User" onClick={() => openDeleteConfirmModal(user)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data && data.totalUsers > 0 && (
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <p>Showing {Math.min((data.currentPage - 1) * data.limit + 1, data.totalUsers)} - {Math.min(data.currentPage * data.limit, data.totalUsers)} of {data.totalUsers} users</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={data.currentPage <= 1 || isLoading || isPreviousData}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>
            <span>Page {data.currentPage} of {data.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => prev + 1)} disabled={data.currentPage >= data.totalPages || isLoading || isPreviousData}><ArrowRight className="ml-2 h-4 w-4" />Next</Button>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Roles for {selectedUser?.name || selectedUser?.email}</DialogTitle>
            <DialogDescription>Select the roles for this user.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm">User: <span className="font-medium">{selectedUser?.email}</span></p>
            {AVAILABLE_ROLES.map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}`}
                  checked={editingRoles.includes(role)}
                  onCheckedChange={(checked) => handleRoleChange(role, Boolean(checked))}
                />
                <Label htmlFor={`role-${role}`} className="capitalize">{role}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoleModal(false)} disabled={editUserMutation.isLoading}>Cancel</Button>
            <Button onClick={handleSaveRoles} disabled={editUserMutation.isLoading}>
              {editUserMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user: <span className="font-semibold">{selectedUser?.name || selectedUser?.email}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} disabled={deleteUserMutation.isLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed} disabled={deleteUserMutation.isLoading}>
              {deleteUserMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManager;
