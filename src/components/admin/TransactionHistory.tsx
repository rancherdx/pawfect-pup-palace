
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
  Receipt, Search, Download, ArrowLeft, ArrowRight, Loader2, DollarSign, CheckCircle, XCircle, Edit3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from '@/api/client';

interface Transaction {
  id: string;
  created_at: string;
  user_id: string | null;
  puppy_id: string | null;
  square_payment_id: string | null;
  amount: number;
  currency: string;
  payment_method_details: { brand?: string; last4?: string; type?: string } | null;
  status: string;
}

interface ApiResponse {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  limit: number;
}

const TransactionHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [currentTransactionForRefund, setCurrentTransactionForRefund] = useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");

  const queryClient = useQueryClient();
  const rowsPerPage = 10;

  const filterOptions = ["All", "COMPLETED", "AUTHORIZED", "DEPOSIT", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELED", "FAILED"];
  // Note: 'DEPOSIT' might be equivalent to 'AUTHORIZED' or a custom status based on authorizeOnly flow.
  // 'CAPTURED' is often an internal step before 'COMPLETED'. Using 'COMPLETED' as the primary captured state.

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const fetchTransactions = async ({ queryKey }: any): Promise<ApiResponse> => {
    const [_key, page, limit, status, search] = queryKey;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status && status !== "All") {
      params.append('status', status);
    }
    if (search) {
      params.append('searchQuery', search);
    }
    return apiRequest<ApiResponse>(`/admin/transactions?${params.toString()}`);
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['transactions', currentPage, rowsPerPage, selectedFilter, debouncedSearchQuery],
    queryFn: fetchTransactions,
    staleTime: 5 * 60 * 1000,
  });

  const handleStatusFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const formatCurrency = (amountInCents: number, currencyCode: string = "USD") => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })
      .format(amountInCents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status?.toUpperCase()) {
        case 'COMPLETED': return 'default'; // Green in some themes
        case 'CAPTURED': return 'default'; // Similar to COMPLETED
        case 'AUTHORIZED': return 'secondary'; // Yellow/Orange or Blue
        case 'DEPOSIT': return 'secondary'; // Often similar to AUTHORIZED
        case 'PENDING': return 'outline'; // Gray
        case 'REFUNDED': return 'secondary'; // Blue or Gray
        case 'PARTIALLY_REFUNDED': return 'secondary';
        case 'CANCELED': return 'outline';
        case 'FAILED': return 'destructive'; // Red
        default: return 'outline';
    }
  };

  // --- Mutations ---
  const capturePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => apiRequest(`/admin/payments/${paymentId}/capture`, { method: 'POST' }),
    onSuccess: (data, paymentId) => {
      toast.success(`Payment ${paymentId} captured successfully!`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any, paymentId) => {
      toast.error(`Failed to capture payment ${paymentId}: ${error.message || 'Unknown error'}`);
    },
  });

  const refundPaymentMutation = useMutation({
    mutationFn: (payload: { payment_id: string; amount: number; currency: string; reason?: string }) =>
      apiRequest(`/admin/refunds`, { method: 'POST', body: payload }),
    onSuccess: (data: any) // Type according to your API response for refund
    ) => {
      toast.success(`Refund processed successfully for payment ${data.refund?.payment_id}. Refund ID: ${data.refund?.id}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsRefundModalOpen(false);
      setCurrentTransactionForRefund(null);
    },
    onError: (error: any) => {
      toast.error(`Refund failed: ${error.message || 'Unknown error'}`);
    },
  });

  const handleOpenRefundModal = (transaction: Transaction) => {
    setCurrentTransactionForRefund(transaction);
    setRefundAmount(transaction.amount); // Default to full amount
    setRefundReason("");
    setIsRefundModalOpen(true);
  };

  const handleProcessRefund = () => {
    if (!currentTransactionForRefund || !currentTransactionForRefund.square_payment_id) {
      toast.error("No transaction selected or missing payment ID for refund.");
      return;
    }
    if (refundAmount <= 0) {
      toast.error("Refund amount must be greater than zero.");
      return;
    }
    if (refundAmount > currentTransactionForRefund.amount) {
      toast.error("Refund amount cannot exceed original transaction amount.");
      return;
    }

    refundPaymentMutation.mutate({
      payment_id: currentTransactionForRefund.square_payment_id,
      amount: refundAmount, // Amount is already in cents
      currency: currentTransactionForRefund.currency,
      reason: refundReason,
    });
  };


  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <Receipt className="mr-2 h-8 w-8 text-brand-red" />
          Transaction History
        </h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text"
              placeholder="Search by ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
            />
          </div>
          <div className="flex overflow-x-auto md:overflow-visible">
            {filterOptions.map(filter => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(filter)}
                className={`${selectedFilter === filter ? "bg-brand-red text-white hover:bg-brand-red/90" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                           min-w-max px-3 first:rounded-l-md last:rounded-r-md border-l-0 first:border-l`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Transactions Table Card */}
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Transactions</span>
            <Button variant="outline" size="sm" className="text-sm flex items-center" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export CSV (Soon)
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Square ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={7} className="py-2">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                      Error fetching transactions: {error?.message || "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : data?.transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell className="text-xs">{formatDate(transaction.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.square_payment_id || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                      <TableCell className="text-xs">
                        {transaction.payment_method_details?.brand ?
                         `${transaction.payment_method_details.brand} ****${transaction.payment_method_details.last4}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {transaction.status?.toUpperCase() === 'AUTHORIZED' && transaction.square_payment_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => capturePaymentMutation.mutate(transaction.square_payment_id!)}
                            disabled={capturePaymentMutation.isPending}
                          >
                            {capturePaymentMutation.isPending && capturePaymentMutation.variables === transaction.square_payment_id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            Capture
                          </Button>
                        )}
                        {(transaction.status?.toUpperCase() === 'COMPLETED' || transaction.status?.toUpperCase() === 'CAPTURED') && transaction.square_payment_id && (
                           <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => handleOpenRefundModal(transaction)}
                            disabled={refundPaymentMutation.isPending && currentTransactionForRefund?.id === transaction.id}
                          >
                            {refundPaymentMutation.isPending && currentTransactionForRefund?.id === transaction.id ? (
                               <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                               <DollarSign className="mr-1 h-3 w-3" />
                            )}
                            Refund
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details (Not Implemented)">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination Controls */}
      {data && data.totalTransactions > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((data.currentPage - 1) * data.limit + 1, data.totalTransactions)}
            {' '}- {Math.min(data.currentPage * data.limit, data.totalTransactions)}
            {' '}of {data.totalTransactions} transactions
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={data.currentPage <= 1 || isLoading || isFetching}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span className="text-sm">Page {data.currentPage} of {data.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={data.currentPage >= data.totalPages || isLoading || isFetching}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Status Legend */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700 mt-2">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">Transaction Statuses Guide:</h3>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          {filterOptions.filter(opt => opt !== "All").map(status => (
             <li key={status} className="flex items-center py-0.5">
                <Badge variant={getStatusBadgeVariant(status)} className="mr-2 h-2 w-2 p-0 rounded-full min-w-[0.5rem]" />
                <span><strong>{status}:</strong>
                  {status === 'AUTHORIZED' ? ' Payment authorized, awaiting capture.' :
                   status === 'COMPLETED' ? ' Payment successfully captured.' :
                   status === 'CAPTURED' ? ' Payment successfully captured (synonym for COMPLETED).' :
                   status === 'REFUNDED' ? ' Full payment refunded.' :
                   status === 'PARTIALLY_REFUNDED' ? ' Part of the payment refunded.' :
                   status === 'DEPOSIT' ? ' Deposit made (likely an AUTHORIZED payment).' :
                   ' Other status.'}
                </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Refund Modal */}
      {currentTransactionForRefund && (
        <AlertDialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Refund Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Refunding payment for Square ID: <span className="font-mono text-xs">{currentTransactionForRefund.square_payment_id}</span>.
                Original amount: {formatCurrency(currentTransactionForRefund.amount, currentTransactionForRefund.currency)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="refund-amount">Refund Amount ({currentTransactionForRefund.currency})</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  value={refundAmount / 100} // Display in dollars/euros, etc.
                  onChange={(e) => setRefundAmount(Math.round(parseFloat(e.target.value) * 100))} // Store in cents
                  max={currentTransactionForRefund.amount / 100}
                  step="0.01"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="refund-reason">Reason (Optional)</Label>
                <Input
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Item returned"
                  className="mt-1"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCurrentTransactionForRefund(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleProcessRefund}
                disabled={refundPaymentMutation.isPending || refundAmount <=0 || refundAmount > currentTransactionForRefund.amount}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {refundPaymentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                Submit Refund
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default TransactionHistory;
