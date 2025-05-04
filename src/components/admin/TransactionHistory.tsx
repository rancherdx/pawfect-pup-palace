
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Search, Download, ArrowLeft, ArrowRight } from "lucide-react";

// Mock data for demo purposes
const initialTransactions = [
  {
    id: "INV-2024-1001",
    date: "2024-05-01",
    customer: "John Smith",
    puppy: "Max (Golden Retriever)",
    amount: 1200,
    paymentMethod: "Credit Card",
    status: "Completed"
  },
  {
    id: "INV-2024-1002",
    date: "2024-05-02",
    customer: "Sarah Johnson",
    puppy: "Bella (German Shepherd)",
    amount: 500,
    paymentMethod: "Cash",
    status: "Deposit"
  },
  {
    id: "INV-2024-1003",
    date: "2024-05-02",
    customer: "Robert Williams",
    puppy: "Charlie (Labrador)",
    amount: 1500,
    paymentMethod: "Square Invoice",
    status: "Completed"
  },
  {
    id: "INV-2024-1004",
    date: "2024-05-03",
    customer: "Emily Davis",
    puppy: "Luna (Poodle)",
    amount: 600,
    paymentMethod: "Credit Card",
    status: "Deposit"
  },
  {
    id: "INV-2024-1005",
    date: "2024-05-04",
    customer: "Michael Brown",
    puppy: "Daisy (Beagle)",
    amount: 1000,
    paymentMethod: "Bank Transfer",
    status: "Completed"
  }
];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  
  const filterOptions = ["All", "Completed", "Deposit", "Refunded"];

  const filteredTransactions = transactions.filter(transaction => {
    // Apply status filter
    const statusMatch = selectedFilter === "All" || transaction.status === selectedFilter;
    
    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
      transaction.id.toLowerCase().includes(searchLower) ||
      transaction.customer.toLowerCase().includes(searchLower) ||
      transaction.puppy.toLowerCase().includes(searchLower);
    
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <Receipt className="mr-2 h-8 w-8 text-brand-red" />
          Transaction History
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          
          <div className="flex">
            {filterOptions.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 ${
                  selectedFilter === filter 
                    ? "bg-brand-red text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${filter === "All" ? "rounded-l-lg" : ""} ${filter === "Refunded" ? "rounded-r-lg" : ""}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Recent Transactions</span>
            <Button
              variant="outline"
              size="sm"
              className="text-sm flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Puppy</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>{transaction.puppy}</TableCell>
                      <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "Deposit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="View Receipt"
                        >
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
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300 mt-2">
        <h3 className="font-medium">Transaction Types:</h3>
        <ul className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <li className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            <span><strong>Completed:</strong> Full payment received</span>
          </li>
          <li className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
            <span><strong>Deposit:</strong> Partial payment received</span>
          </li>
          <li className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
            <span><strong>Refunded:</strong> Payment returned to customer</span>
          </li>
          <li className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
            <span><strong>Synced with Square:</strong> All transactions are automatically synced</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionHistory;
