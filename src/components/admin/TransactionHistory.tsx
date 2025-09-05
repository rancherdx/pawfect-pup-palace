import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Search, Download, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { adminApi } from '@/api';

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
  const rowsPerPage = 10;

  const filterOptions = ["All", "COMPLETED", "DEPOSIT", "REFUNDED", "CANCELED", "FAILED"];

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

  const fetchTransactions = async ({ queryKey }: { queryKey: [string, number, number, string, string] }): Promise<ApiResponse> => {
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
    return adminApi.getTransactions(params);
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
        case 'COMPLETED': return 'default';
        case 'DEPOSIT': return 'secondary';
        case 'PENDING': return 'outline';
        case 'REFUNDED': return 'secondary';
        case 'CANCELED': return 'outline';
        case 'FAILED': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
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
          
          <div className="flex">
            {filterOptions.map(filter => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(filter)}
                className={`${selectedFilter === filter ? "bg-brand-red text-white hover:bg-brand-red/90" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                           ${filter === "All" ? "rounded-l-md" : ""}
                           ${filter === filterOptions[filterOptions.length - 1] ? "rounded-r-md" : ""}
                           border-l-0 first:border-l`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
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
                         
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {data.currentPage} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={data.currentPage >= data.totalPages || isLoading || isFetching}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700 mt-2">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">Transaction Statuses:</h3>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
          {filterOptions.filter(opt => opt !== "All").map(status => (
             <li key={status} className="flex items-center">
                <Badge variant={getStatusBadgeVariant(status)} className="mr-2 h-2 w-2 p-0 rounded-full" />
                <span><strong>{status}:</strong> Placeholder description for {status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransactionHistory;
