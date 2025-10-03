import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from '@/api';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit3, Eye, CheckCircle, XCircle, Hourglass, Filter } from "lucide-react";
import { format } from 'date-fns';
import { DataDeletionRequest, DataDeletionRequestStatus } from "@/types/api";

const STATUS_OPTIONS: DataDeletionRequestStatus[] = ['pending', 'processing', 'completed', 'rejected'];

/**
 * @component DataDeletionRequestsManager
 * @description A component for admins to manage user data deletion requests.
 * @returns {React.ReactElement} The rendered data deletion request management interface.
 */
const DataDeletionRequestsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<DataDeletionRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<DataDeletionRequestStatus>('pending');
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<DataDeletionRequestStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dataDeletionRequests', { page: currentPage, limit, status: filterStatus === 'all' ? undefined : filterStatus }],
    queryFn: () => adminApi.getDataDeletionRequests({ page: currentPage, limit, status: filterStatus === 'all' ? undefined : filterStatus }),
    staleTime: 5 * 60 * 1000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, admin_notes }: { id: string; status: DataDeletionRequestStatus; admin_notes: string }) =>
      adminApi.updateDataDeletionRequestStatus(id, status, { admin_notes }),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: ['dataDeletionRequests'] });
      setIsEditModalOpen(false);
      toast({ title: "Status Updated", description: `Request ${updatedRequest.id.substring(0,8)} status updated to ${updatedRequest.status}.`, className: "bg-green-500 text-white" });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: err.message || "An unexpected error occurred.",
      });
    }
  });

  const handleViewDetails = (request: DataDeletionRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleEditRequest = (request: DataDeletionRequest) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditAdminNotes(request.admin_notes || "");
    setIsEditModalOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedRequest) return;
    updateStatusMutation.mutate({ id: selectedRequest.id, status: editStatus, admin_notes: editAdminNotes });
  };

  const getStatusBadgeVariant = (status: DataDeletionRequestStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'secondary';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={data.currentPage === 1}>Previous</Button>
        <span>Page {data.currentPage} of {data.totalPages} ({data.total} items)</span>
        <Button onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))} disabled={data.currentPage === data.totalPages}>Next</Button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Data Deletion Requests</h2>

      <div className="mb-4 flex items-center space-x-2">
        <Label htmlFor="status-filter">Filter by status:</Label>
        <Select value={filterStatus} onValueChange={(value: DataDeletionRequestStatus | "all") => { setFilterStatus(value); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader><TableRow>
          <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead>
          <TableHead>Requested At</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {isLoading ? (<tr><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></tr>)
          : isError ? (<tr><TableCell colSpan={6} className="text-center text-red-500">Error: {error.message}</TableCell></tr>)
          : data?.data.length === 0 ? (<tr><TableCell colSpan={6} className="text-center">No data deletion requests found.</TableCell></tr>)
          : data?.data.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-mono text-xs">{req.id.substring(0,8)}...</TableCell>
              <TableCell>{req.name || "N/A"}</TableCell>
              <TableCell>{req.email}</TableCell>
              <TableCell>{format(new Date(req.requested_at), "PPpp")}</TableCell>
              <TableCell><Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge></TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(req)} className="mr-2"><Eye className="h-4 w-4 mr-1"/>View</Button>
                <Button variant="outline" size="sm" onClick={() => handleEditRequest(req)}><Edit3 className="h-4 w-4 mr-1"/>Manage</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {renderPagination()}

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Request Details (ID: {selectedRequest?.id.substring(0,8)}...)</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-3 py-4 max-h-[70vh] overflow-y-auto">
              <p><strong>Name:</strong> {selectedRequest.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedRequest.email || "N/A"}</p>
              <p><strong>Requested At:</strong> {format(new Date(selectedRequest.requested_at), "PPpp")}</p>
              <p><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge></p>
              <p><strong>Account Creation Timeframe:</strong> {selectedRequest.account_creation_timeframe || "N/A"}</p>
              <p><strong>Puppy IDs:</strong> {selectedRequest.puppy_ids || "N/A"}</p>
              <div><strong>Additional Details:</strong> <div className="mt-1 p-2 border rounded-md bg-gray-50 text-sm whitespace-pre-wrap">{selectedRequest.additional_details || "N/A"}</div></div>
              {selectedRequest.processed_at && <p><strong>Processed At:</strong> {format(new Date(selectedRequest.processed_at), "PPpp")}</p>}
              <div><strong>Admin Notes:</strong> <div className="mt-1 p-2 border rounded-md bg-gray-50 text-sm whitespace-pre-wrap">{selectedRequest.admin_notes || "No notes yet."}</div></div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Request (ID: {selectedRequest?.id.substring(0,8)}...)</DialogTitle>
            <DialogDescription>Update status and add internal notes for this request.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editStatus} onValueChange={(value: DataDeletionRequestStatus) => setEditStatus(value)}>
                  <SelectTrigger id="edit-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status === 'pending' && <Hourglass className="h-4 w-4 mr-2 inline-block"/>}
                        {status === 'processing' && <Loader2 className="h-4 w-4 mr-2 inline-block animate-spin"/>}
                        {status === 'completed' && <CheckCircle className="h-4 w-4 mr-2 inline-block text-green-600"/>}
                        {status === 'rejected' && <XCircle className="h-4 w-4 mr-2 inline-block text-red-600"/>}
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea id="admin-notes" value={editAdminNotes} onChange={(e) => setEditAdminNotes(e.target.value)} rows={4} placeholder="Internal notes..."/>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataDeletionRequestsManager;