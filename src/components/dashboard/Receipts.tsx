
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Download, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Mock data for receipts
const mockReceipts = [
  {
    id: "INV-001",
    date: "2023-05-15",
    amount: 1200,
    description: "Adoption Fee - Golden Retriever Puppy (Luna)",
    status: "paid",
    items: [
      { name: "Adoption Fee", price: 950 },
      { name: "Microchipping", price: 75 },
      { name: "First Vaccinations", price: 125 },
      { name: "Starter Kit", price: 50 }
    ]
  },
  {
    id: "INV-002",
    date: "2023-09-22",
    amount: 1500,
    description: "Adoption Fee - Labrador Retriever Puppy (Buddy)",
    status: "paid",
    items: [
      { name: "Adoption Fee", price: 1200 },
      { name: "Microchipping", price: 75 },
      { name: "First Vaccinations", price: 125 },
      { name: "Premium Health Check", price: 100 }
    ]
  },
  {
    id: "INV-003",
    date: "2024-01-10",
    amount: 250,
    description: "Follow-up Veterinary Services",
    status: "pending",
    items: [
      { name: "Health Check", price: 150 },
      { name: "Booster Shots", price: 100 }
    ]
  }
];

const ReceiptDetail = ({ receipt, onClose }: { receipt: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold">Receipt #{receipt.id}</h3>
              <p className="text-muted-foreground">
                {new Date(receipt.date).toLocaleDateString()}
              </p>
            </div>
            <Badge 
              className={receipt.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}
            >
              {receipt.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Description</h4>
            <p>{receipt.description}</p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Items</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-2 px-4">Item</th>
                    <th className="text-right py-2 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {receipt.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4 text-right">${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t">
                  <tr className="font-medium">
                    <td className="py-2 px-4">Total</td>
                    <td className="py-2 px-4 text-right">${receipt.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-brand-red hover:bg-red-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Receipts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  
  // Filter receipts based on search query
  const filteredReceipts = mockReceipts.filter(receipt => 
    receipt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Receipt className="h-6 w-6 mr-2 text-brand-red" />
          Adoption Records
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-[200px]"
          />
        </div>
      </div>
      
      {filteredReceipts.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">No Records Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "You don't have any adoption records yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1 w-full ${receipt.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">Receipt #{receipt.id}</CardTitle>
                  <Badge 
                    className={receipt.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'}
                  >
                    {receipt.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date(receipt.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">${receipt.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{receipt.description}</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedReceipt && (
        <ReceiptDetail 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
        />
      )}
    </div>
  );
};

export default Receipts;
