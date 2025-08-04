import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit3, Eye, CheckCircle, XCircle, Hourglass, Filter } from "lucide-react";
import { format } from 'date-fns';

interface DeletionRequest {
  id: string;
  name?: string;
  email?: string;
  account_creation_timeframe?: string;
  puppy_ids?: string;
  additional_details?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string | null;
  admin_notes?: string | null;
}

interface ApiResponse {
  requests: DeletionRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRequests: number;
    limit: number;
  };
}

const DataDeletionRequestsManager = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<DeletionRequest['status']>('pending');
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchRequests = useCallback(async (page = 1, status = "") => {
    setIsLoading(true);
    try {
      let url = `/admin/data-deletion-requests?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await apiRequest(url) as ApiResponse;
      setRequests(response.requests || []);
      setCurrentPage(response.pagination?.currentPage || 1);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalRequests || 0);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to fetch requests",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests(currentPage, filterStatus);
  }, [fetchRequests, currentPage, filterStatus]);

  const handleViewDetails = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleEditRequest = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditAdminNotes(request.admin_notes || "");
    setIsEditModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    setIsLoading(true);
    try {
      const updatedRequest = await apiRequest(
        `/admin/data-deletion-requests/${selectedRequest.id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status: editStatus, admin_notes: editAdminNotes }),
        }
      ) as { request: DeletionRequest };
      setRequests(prev => prev.map(r => (r.id === updatedRequest.request.id ? updatedRequest.request : r)));
      setIsEditModalOpen(false);
      toast({ title: "Status Updated", description: `Request ${selectedRequest.id} status updated to ${editStatus}.`, className: "bg-green-500 text-white" });
      fetchRequests(currentPage, filterStatus);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: DeletionRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'secondary';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
        <span>Page {currentPage} of {totalPages} ({totalItems} items)</span>
        <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
      </div>
    );
  };

  if (isLoading && requests.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-red" /><p className="ml-2">Loading requests...</p></div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Data Deletion Requests</h2>

      <div className="mb-4 flex items-center space-x-2">
        <Label htmlFor="status-filter">Filter by status:</Label>
        <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value === "all" ? "" : value); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => fetchRequests(1, filterStatus)} variant="outline" size="icon" title="Refresh">
            <Filter className="h-4 w-4"/>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Requested At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <tr><TableCell colSpan={6} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></tr>}
          {!isLoading && requests.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center">No data deletion requests found.</TableCell></TableRow>
          )}
          {!isLoading && requests.map((req) => (
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

      {/* View Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details (ID: {selectedRequest?.id.substring(0,8)}...)</DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status/Notes Modal */}
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
                <Select value={editStatus} onValueChange={(value: DeletionRequest['status']) => setEditStatus(value)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending"><Hourglass className="h-4 w-4 mr-2 inline-block"/>Pending</SelectItem>
                    <SelectItem value="processing"><Loader2 className="h-4 w-4 mr-2 inline-block animate-spin"/>Processing</SelectItem>
                    <SelectItem value="completed"><CheckCircle className="h-4 w-4 mr-2 inline-block text-green-600"/>Completed</SelectItem>
                    <SelectItem value="rejected"><XCircle className="h-4 w-4 mr-2 inline-block text-red-600"/>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Internal notes about the request processing..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleStatusUpdate} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataDeletionRequestsManager;
