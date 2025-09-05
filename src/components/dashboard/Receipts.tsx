import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Download, Eye, Search, ArrowLeft, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fetchMyTransactionsFromSupabase = async (page: number, limit: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const totalTransactions = count || 0;
  const totalPages = Math.ceil(totalTransactions / limit);

  return {
    transactions: (data || []).map(transaction => ({
      ...transaction,
      payment_method_details: transaction.payment_method_details as { brand?: string; last4?: string; type?: string } | null
    })),
    currentPage: page,
    totalPages,
    totalTransactions,
    limit
  };
};

interface TransactionItem {
  name: string;
  price: number;
  quantity?: number;
}

interface Transaction {
  id: string;
  square_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  puppy_id: string | null;
  payment_method_details: { brand?: string; last4?: string; type?: string } | null;
  items?: TransactionItem[];
  description?: string;
}

interface TransactionsApiResponse {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  limit: number;
}

const getStatusBadgeClass = (status: string) => {
  switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
      case 'DEPOSIT': return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
      case 'REFUNDED': return 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300';
      case 'CANCELED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const ReceiptDetail = ({ transaction, onClose }: { transaction: Transaction, onClose: () => void }) => {
  const items = transaction.items || [
    {
      name: `Payment for ${transaction.puppy_id ? `Puppy ID: ${transaction.puppy_id}` : 'Service/Product'}`,
      price: transaction.amount / 100,
      quantity: 1
    }
  ];
  const description = transaction.description || `Transaction ID: ${transaction.id}`;

  const handleDownloadPdf = (currentTransaction: Transaction) => {
    console.log("Download PDF requested for receipt:", currentTransaction.id);
    toast.info(`PDF generation for receipt ${currentTransaction.square_payment_id || currentTransaction.id} is not yet implemented. This feature is coming soon!`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Receipt #{transaction.square_payment_id || transaction.id}</CardTitle>
              <p className="text-muted-foreground text-sm">
                Date: {new Date(transaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Badge className={getStatusBadgeClass(transaction.status)}>
              {transaction.status?.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Summary</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            {transaction.payment_method_details?.brand && (
                 <p className="text-sm text-muted-foreground">Paid with: {transaction.payment_method_details.brand} ****{transaction.payment_method_details.last4}</p>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
            <div className="border dark:border-gray-700 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 dark:bg-gray-700/30">
                  <tr>
                    <th className="text-left py-2.5 px-4 font-medium">Item</th>
                    <th className="text-right py-2.5 px-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2.5 px-4">{item.name}</td>
                      <td className="py-2.5 px-4 text-right">${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t dark:border-gray-700 bg-muted/50 dark:bg-gray-700/30">
                  <tr className="font-semibold">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right text-lg">${(transaction.amount / 100).toFixed(2)} {transaction.currency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button
              className="bg-brand-red hover:bg-red-700 text-white"
              onClick={() => handleDownloadPdf(transaction)}
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Receipts = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchMyTransactions = async ({ queryKey }: { queryKey: [string, number, number] }): Promise<TransactionsApiResponse> => {
    const [_key, page, limit] = queryKey;
    return fetchMyTransactionsFromSupabase(page, limit);
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['myTransactions', currentPage, rowsPerPage],
    queryFn: fetchMyTransactions,
    staleTime: 5 * 60 * 1000,
    enabled: !!user, // Only run query if user is authenticated
  });

  const filteredReceipts = useMemo(() => {
    if (!data?.transactions) return [];
    if (!searchQuery) return data.transactions;

    const searchLower = searchQuery.toLowerCase();
    return data.transactions.filter(receipt =>
      (receipt.id.toLowerCase().includes(searchLower)) ||
      (receipt.square_payment_id && receipt.square_payment_id.toLowerCase().includes(searchLower)) ||
      (receipt.puppy_id && `puppy id ${receipt.puppy_id}`.toLowerCase().includes(searchLower)) ||
      (receipt.status.toLowerCase().includes(searchLower))
    );
  }, [data?.transactions, searchQuery]);

  const handleViewReceipt = (receipt: Transaction) => {
    const displayItems = receipt.items || [
        {
          name: `Payment for ${receipt.puppy_id ? `Puppy ID: ${receipt.puppy_id}` : (receipt.square_payment_id || receipt.id)}`,
          price: receipt.amount / 100,
          quantity: 1
        }
      ];
    setSelectedReceipt({...receipt, items: displayItems, description: `Transaction ID: ${receipt.id}` });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center text-gray-800 dark:text-white">
          <Receipt className="h-6 w-6 mr-2 text-brand-red" />
          My Adoption Records
        </h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search current page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-[200px] md:w-[250px] text-sm"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <CardHeader className="pb-2"><div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
         <div className="text-center py-12 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 dark:text-red-400" />
          <h3 className="text-xl font-semibold mt-4 text-red-600 dark:text-red-300">Error Fetching Records</h3>
          <p className="text-red-500 dark:text-red-400">{error?.message || "An unknown error occurred."}</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">Try Again</Button>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 dark:bg-gray-800/30 rounded-lg">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4 text-gray-700 dark:text-gray-200">No Records Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms for the current page." : "You don't have any adoption records yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden hover:shadow-lg transition-shadow dark:border-gray-700">
              <div className={`h-1.5 w-full ${
                receipt.status.toUpperCase() === 'COMPLETED' ? 'bg-green-500'
                : receipt.status.toUpperCase() === 'PENDING' || receipt.status.toUpperCase() === 'DEPOSIT' ? 'bg-yellow-500'
                : 'bg-red-500'
              }`} />
              <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Order ID: {receipt.square_payment_id || receipt.id.substring(0,8)}
                  </CardTitle>
                  <Badge className={getStatusBadgeClass(receipt.status)}>
                    {receipt.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(receipt.created_at).toLocaleDateString('en-US', {dateStyle: 'medium'})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-lg">{(receipt.amount / 100).toFixed(2)} {receipt.currency}</span>
                  </div>
                   <p className="text-xs text-muted-foreground pt-1">
                    Transaction ID: {receipt.id}
                  </p>
                  <div className="flex justify-end space-x-2 pt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalTransactions > rowsPerPage && (
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((data.currentPage - 1) * data.limit + 1, data.totalTransactions)}
            {' '}- {Math.min(data.currentPage * data.limit, data.totalTransactions)}
            {' '}of {data.totalTransactions} records
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
            <span className="text-sm p-2 rounded-md bg-muted font-medium">
              {data.currentPage} / {data.totalPages}
            </span>
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

      {selectedReceipt && (
        <ReceiptDetail 
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)} 
        />
      )}
    </div>
  );
};

export default Receipts;
