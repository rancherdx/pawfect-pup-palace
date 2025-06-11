import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // For description
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest, adminApi } from "@/api/client"; // Assuming adminApi can be extended or use generic apiRequest
import { toast } from "sonner";
import { UserPlus, DollarSign, Loader2, Users, Search } from "lucide-react";
import { User } from "@/types"; // Assuming a User type is available

// Basic User type for search results, expand as needed
interface SearchedUser {
  id: string;
  name: string;
  email: string;
}

const PuppyCreditManager = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState<number | string>(""); // Store as string to allow empty input, parse to number for API
  const [description, setDescription] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);

  const queryClient = useQueryClient();

  const { data: userSearchResults, isLoading: isLoadingUsers } = useQuery<User[], Error>({
    queryKey: ['adminUserSearch', userSearchTerm],
    queryFn: () => adminApi.listUsers({ page: 1, limit: 5, searchQuery: userSearchTerm }), // Adapt if listUsers has different signature
    enabled: userSearchTerm.length > 2, // Only search when term is long enough
    select: (data: any) => data.users || [], // Assuming API returns { users: [...] }
  });

  const issueCreditsMutation = useMutation({
    mutationFn: (payload: { user_id: string; amount: number; description: string }) =>
      apiRequest('/admin/puppy-credits/issue', { method: 'POST', body: payload }),
    onSuccess: (data: any) // Define specific type for API response if available
    ) => {
      toast.success(data.message || "Credits issued successfully!");
      queryClient.invalidateQueries({ queryKey: ['puppyCredits', userId] }); // Invalidate user's balance if they are viewing it
      queryClient.invalidateQueries({ queryKey: ['puppyCreditHistory', userId] });
      // Reset form
      setUserId("");
      setAmount("");
      setDescription("");
      setSelectedUser(null);
      setUserSearchTerm("");
    },
    onError: (error: any) => {
      toast.error(`Failed to issue credits: ${error.message || 'Unknown error'}`);
    },
  });

  const handleIssueCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.id) {
      toast.error("Please select a user.");
      return;
    }
    const numericAmount = parseInt(String(amount), 10); // Amount in cents
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description for the transaction.");
      return;
    }

    issueCreditsMutation.mutate({
      user_id: selectedUser.id,
      amount: numericAmount,
      description: description,
    });
  };

  const handleUserSelect = (user: SearchedUser) => {
    setSelectedUser(user);
    setUserId(user.id); // Keep separate userId state if needed, or just use selectedUser.id
    setUserSearchTerm(user.email); // Populate search box with email for clarity
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/30">
        <CardTitle className="text-2xl font-semibold flex items-center">
          <UserPlus className="mr-3 h-6 w-6 text-brand-red" />
          Issue Puppy Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleIssueCredits} className="space-y-6">
          <div>
            <Label htmlFor="user-search" className="flex items-center mb-1">
              <Users className="mr-2 h-4 w-4 text-gray-600" />
              Search and Select User
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="user-search"
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setSelectedUser(null); // Clear selection when search term changes
                  setUserId("");
                }}
                className="pl-10"
              />
            </div>
            {isLoadingUsers && <Loader2 className="mt-2 h-4 w-4 animate-spin text-gray-500" />}
            {userSearchResults && userSearchTerm.length > 2 && !isLoadingUsers && (
              <div className="mt-2 border rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
                {userSearchResults.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">No users found.</p>
                ) : (
                  userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Selected User: {selectedUser.name} ({selectedUser.email})</p>
              <Input type="hidden" value={selectedUser.id} />
            </div>
          )}

          <div>
            <Label htmlFor="amount" className="flex items-center mb-1">
              <DollarSign className="mr-2 h-4 w-4 text-gray-600" />
              Amount (in cents)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 5000 for $50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              disabled={!selectedUser || issueCreditsMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center mb-1">
                <Edit3 className="mr-2 h-4 w-4 text-gray-600" />
                Description
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., Referral bonus, Birthday gift, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={!selectedUser || issueCreditsMutation.isPending}
              className="h-24"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-red hover:bg-red-700 text-white py-3 text-base"
            disabled={!selectedUser || issueCreditsMutation.isPending || !amount || !description}
          >
            {issueCreditsMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-5 w-5" />
            )}
            Issue Credits
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PuppyCreditManager;
