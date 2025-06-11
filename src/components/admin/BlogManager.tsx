
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Eye, Edit, Trash, Plus, MoreHorizontal, Loader2, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, blogApi } from "@/api"; // Assuming adminApi will be used for CUD, blogApi for R
import {
  BlogPost,
  BlogPostsResponse,
  // BlogPostCreateData,
  // BlogPostUpdateData,
  BlogPostStatus,
  BlogPostAuthor
} from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // For delete confirmation

// TODO: Implement a proper form/dialog for creating/editing posts
// For now, mock create/update data types if full forms are out of scope for this step
type TempBlogPostCreateData = Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "author"> & { authorId?: string }>;
type TempBlogPostUpdateData = Partial<TempBlogPostCreateData>;


const BlogManager = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<BlogPostStatus | "all">("all");
  // const [categories, setCategories] = useState(mockCategories); // Category management might be separate
  const [newCategory, setNewCategory] = useState(""); // Keep for now if UI is there
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState<string | null>(null);

  // Fetching posts - using blogApi.getPosts, could be adminApi.getPosts if it exists
  const { data: postsData, isLoading, isError, error } = useQuery<BlogPostsResponse, Error>({
    queryKey: ['adminBlogPosts', { status: activeTab === "all" ? undefined : activeTab }], // Query key changes with tab
    queryFn: () => blogApi.getPosts({ limit: 50, /* offset might be needed for pagination */ }), // Example: fetch 50 posts
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const posts: BlogPost[] = postsData?.posts || [];

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === "all" || post.status === activeTab;
    const matchesSearch = !searchTerm || 
                        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => adminApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      toast.success("Blog post deleted successfully!");
      setShowDeleteDialog(false);
      setPostToDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete post: ${err.message}`);
      setShowDeleteDialog(false);
      setPostToDeleteId(null);
    }
  });

  const handleDeletePost = (postId: string) => {
    setPostToDeleteId(postId);
    setShowDeleteDialog(true);
  };

  const confirmDeletePost = () => {
    if (postToDeleteId) {
      deletePostMutation.mutate(postToDeleteId);
    }
  };

  // Placeholder for update status mutation
  const updatePostStatusMutation = useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: TempBlogPostUpdateData }) => adminApi.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      toast.success("Post status updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Failed to update post status: ${err.message}`);
    }
  });

  const handleToggleStatus = (post: BlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    updatePostStatusMutation.mutate({ postId: post.id, data: { status: newStatus, publishedAt: newStatus === "published" ? new Date().toISOString() : null } });
  };


  // Category management is simplified for now, as API for it is not defined
  // const handleAddCategory = () => { ... }

  const getAuthorDisplay = (author?: BlogPostAuthor | string): string => {
    if (!author) return "N/A";
    if (typeof author === 'string') return author; // If it's just an ID or name string
    return author.name; // If it's an author object
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage your blog content</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="published" onClick={() => setActiveTab("published")}>Published</TabsTrigger>
            <TabsTrigger value="drafts" onClick={() => setActiveTab("draft")}>Drafts</TabsTrigger>
            <TabsTrigger value="archived" onClick={() => setActiveTab("archived")}>Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Simplified Category Management for now */}
        {/* <Dialog> ... </Dialog> */}
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            {isLoading && (
              <div className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-red mx-auto" />
                <p>Loading posts...</p>
              </div>
            )}
            {isError && (
              <div className="p-6 text-center bg-red-50 text-red-700">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Error loading posts: {error?.message}</p>
              </div>
            )}
            {!isLoading && !isError && (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left font-medium">Title</th>
                    <th className="h-12 px-4 text-left font-medium">Category</th>
                    <th className="h-12 px-4 text-left font-medium">Author</th>
                    <th className="h-12 px-4 text-center font-medium">Status</th>
                    <th className="h-12 px-4 text-center font-medium">Date</th>
                    <th className="h-12 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b">
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-4">
                          {post.featuredImageUrl && (
                            <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={post.featuredImageUrl}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{post.title}</p>
                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {post.category && <Badge variant="outline">{post.category}</Badge>}
                      </td>
                      <td className="p-4 align-middle">
                        <span>{getAuthorDisplay(post.author)}</span>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-center">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer"
                              onClick={() => window.open(`/blog/${post.slug}`, '_blank')} // Assuming slug is unique
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center cursor-pointer"
                              // onClick={() => handleEditPost(post)} // TODO: Implement edit functionality
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer"
                              onClick={() => handleToggleStatus(post)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {post.status === "published" ? "Set to Draft" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}

                  {filteredPosts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h3 className="font-medium">No posts found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : activeTab === "all"
                              ? "No posts available. Create one!"
                              : `No posts found in ${activeTab} status.`}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
          <div className="flex justify-between w-full items-center">
            {/* Bulk actions removed for simplicity in this refactor step */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Blog Settings Card - Kept as is for now, may need future refactoring */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Settings</CardTitle>
          <CardDescription>Configure your blog's appearance and functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... existing settings UI ... */}
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>

      {postToDeleteId && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setPostToDeleteId(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePost} disabled={deletePostMutation.isPending}>
                {deletePostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default BlogManager;
