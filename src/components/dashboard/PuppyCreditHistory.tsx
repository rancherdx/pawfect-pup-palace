import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, History, Loader2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // To get current user ID

interface CreditBalanceResponse {
  user_id: string;
  balance_cents: number;
}

interface CreditTransaction {
  id: string;
  type: 'issue' | 'redeem' | 'adjustment' | 'refund_credit';
  amount: number; // in cents
  description: string;
  related_order_id?: string | null;
  created_at: number; // Unix timestamp
}

interface CreditHistoryResponse {
  data: CreditTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

const PuppyCreditHistory = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    error: balanceError
  } = useQuery<CreditBalanceResponse, Error>({
    queryKey: ['puppyCreditBalance', user?.id],
    queryFn: () => apiRequest<CreditBalanceResponse>('/puppy-credits'),
    enabled: !!user?.id, // Only fetch if user is available
  });

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    error: historyError
  } = useQuery<CreditHistoryResponse, Error>({
    queryKey: ['puppyCreditHistory', user?.id, currentPage, rowsPerPage],
    queryFn: () => apiRequest<CreditHistoryResponse>(`/puppy-credits/history?page=${currentPage}&limit=${rowsPerPage}`),
    enabled: !!user?.id,
    keepPreviousData: true, // For smoother pagination
  });

  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(amountInCents / 100);
  };

  const formatDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getTransactionTypeBadgeVariant = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'issue': return 'default'; // Greenish
      case 'redeem': return 'destructive'; // Reddish
      case 'adjustment': return 'secondary'; // Bluish/Grayish
      case 'refund_credit': return 'outline'; // Yellowish/Orangeish
      default: return 'outline';
    }
  };

  if (!user) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><DollarSign className="mr-2 h-6 w-6 text-brand-red" />Puppy Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your puppy credit balance and history.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <DollarSign className="mr-3 h-7 w-7 text-brand-red" />
            Your Puppy Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          {isLoadingBalance && <Loader2 className="h-10 w-10 animate-spin text-brand-red mx-auto" />}
          {balanceError && (
            <div className="text-red-600 flex flex-col items-center">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>Error loading balance: {balanceError.message}</p>
            </div>
          )}
          {!isLoadingBalance && balanceData && (
            <p className="text-5xl font-bold text-brand-dark dark:text-brand-light">
              {formatCurrency(balanceData.balance_cents)}
            </p>
          )}
           {!isLoadingBalance && balanceData?.balance_cents === 0 && (
             <p className="text-muted-foreground mt-2">You currently have no puppy credits.</p>
           )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <History className="mr-2 h-6 w-6 text-brand-red" />
            Credit Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingHistory ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={5} className="py-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : historyError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-red-500">
                      Error loading transaction history: {historyError.message}
                    </TableCell>
                  </TableRow>
                ) : historyData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No credit transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData?.data?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-xs whitespace-nowrap">{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={getTransactionTypeBadgeVariant(transaction.type)} className="capitalize text-xs">
                          {transaction.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium text-xs ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-xs">{transaction.description}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.related_order_id || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {historyData && historyData.pagination.totalItems > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((historyData.pagination.currentPage - 1) * historyData.pagination.limit + 1, historyData.pagination.totalItems)}
            {' '}- {Math.min(historyData.pagination.currentPage * historyData.pagination.limit, historyData.pagination.totalItems)}
            {' '}of {historyData.pagination.totalItems} transactions
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={historyData.pagination.currentPage <= 1 || isLoadingHistory || isFetchingHistory}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span className="text-sm">Page {historyData.pagination.currentPage} of {historyData.pagination.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={historyData.pagination.currentPage >= historyData.pagination.totalPages || isLoadingHistory || isFetchingHistory}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuppyCreditHistory;
